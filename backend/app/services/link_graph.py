import asyncio
import hashlib
import re
from collections import defaultdict
from urllib.parse import urljoin, urldefrag, urlparse

import httpx
from bs4 import BeautifulSoup

def _norm_url(u: str) -> str:
    u, _ = urldefrag(u)
    return u.rstrip("/")

def _url_id(u: str) -> str:
    return hashlib.sha1(u.encode("utf-8")).hexdigest()[:12]

def _domain(u: str) -> str:
    return urlparse(u).netloc.lower()

def extract_links(base_url: str, html: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    out: list[str] = []
    for a in soup.select("a[href]"):
        href = (a.get("href") or "").strip()
        if not href:
            continue
        if re.match(r"^(mailto:|tel:|javascript:)", href, re.I):
            continue
        abs_url = urljoin(base_url, href)
        abs_url = _norm_url(abs_url)
        if not (abs_url.startswith("http://") or abs_url.startswith("https://")):
            continue
        out.append(abs_url)
    return out

DEFAULT_HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; STA220Bot/1.0)"}

MAX_LINKS_PER_PAGE = 250
CONNECT_TIMEOUT = 5.0
READ_TIMEOUT = 10.0
MAX_CONCURRENCY = 20

def _is_html_response(resp: httpx.Response) -> bool:
    ct = resp.headers.get("content-type", "").lower()
    return "text/html" in ct or "application/xhtml+xml" in ct or ct.startswith("text/html")

async def _fetch_html(
    client: httpx.AsyncClient,
    sem: asyncio.Semaphore,
    url: str,
) -> tuple[str, str] | None:
    async with sem:
        try:
            resp = await client.get(url, follow_redirects=True)
            if resp.status_code >= 400:
                return None
            if not _is_html_response(resp):
                return None
            return url, resp.text
        except Exception:
            return None

async def crawl_link_graph(seed_url: str, max_hops: int, max_pages: int, same_domain_only: bool):
    seed_url = _norm_url(seed_url)
    seed_domain = _domain(seed_url)

    discovered: set[str] = set([seed_url])
    depth_map: dict[str, int] = {seed_url: 0}
    edges: set[tuple[str, str]] = set()

    frontier: list[str] = [seed_url]

    limits = httpx.Limits(max_connections=MAX_CONCURRENCY * 2, max_keepalive_connections=MAX_CONCURRENCY * 2)
    timeout = httpx.Timeout(timeout=None, connect=CONNECT_TIMEOUT, read=READ_TIMEOUT)
    sem = asyncio.Semaphore(MAX_CONCURRENCY)

    async with httpx.AsyncClient(headers=DEFAULT_HEADERS, limits=limits, timeout=timeout) as client:
        for d in range(0, max_hops):
            if not frontier:
                break
            if len(discovered) >= max_pages:
                break

            tasks = [asyncio.create_task(_fetch_html(client, sem, u)) for u in frontier]
            results = await asyncio.gather(*tasks)

            next_frontier: list[str] = []

            for item in results:
                if not item:
                    continue
                cur_url, html = item

                links = extract_links(cur_url, html)
                if len(links) > MAX_LINKS_PER_PAGE:
                    links = links[:MAX_LINKS_PER_PAGE]

                for nxt in links:
                    if same_domain_only and _domain(nxt) != seed_domain:
                        continue

                    edges.add((cur_url, nxt))

                    if nxt not in discovered:
                        discovered.add(nxt)
                        depth_map[nxt] = d + 1
                        next_frontier.append(nxt)

                        if len(discovered) >= max_pages:
                            break
                if len(discovered) >= max_pages:
                    break

            frontier = next_frontier

    return seed_url, discovered, depth_map, edges

def pagerank(urls: list[str], edges: list[tuple[str, str]], damping: float = 0.85, iters: int = 30):
    outlinks = defaultdict(list)
    inlinks = defaultdict(list)

    for s, t in edges:
        outlinks[s].append(t)
        inlinks[t].append(s)

    n = len(urls)
    if n == 0:
        return {}

    pr = {u: 1.0 / n for u in urls}

    for _ in range(iters):
        new_pr = {}
        base = (1.0 - damping) / n
        for u in urls:
            rank_sum = 0.0
            for v in inlinks.get(u, []):
                outdeg = len(outlinks.get(v, []))
                if outdeg:
                    rank_sum += pr[v] / outdeg
            new_pr[u] = base + damping * rank_sum
        pr = new_pr

    s = sum(pr.values()) or 1.0
    for u in pr:
        pr[u] /= s
    return pr

async def build_graph_response(seed_url: str, max_hops: int, max_pages: int, same_domain_only: bool):
    seed, nodes_set, depth_map, edge_set = await crawl_link_graph(seed_url, max_hops, max_pages, same_domain_only)

    urls = sorted(nodes_set, key=lambda u: (depth_map.get(u, 999), u))
    edges = [(s, t) for (s, t) in edge_set if s in nodes_set and t in nodes_set]

    pr = pagerank(urls, edges)

    nodes = [
        {
            "id": _url_id(u),
            "url": u,
            "domain": _domain(u),
            "depth": int(depth_map.get(u, 0)),
            "pagerank": float(pr.get(u, 0.0)),
        }
        for u in urls
    ]

    id_map = {n["url"]: n["id"] for n in nodes}
    out_edges = [
        {"source": id_map[s], "target": id_map[t]}
        for (s, t) in edges
        if s in id_map and t in id_map
    ]

    return seed, nodes, out_edges