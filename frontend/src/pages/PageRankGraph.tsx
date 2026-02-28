import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import { Compass, Database, Eye, Link2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Accordion } from "../components/ui/Accordion";
import { getPageRankGraph } from "../apis/graph.api";
import { type GraphResponse, type GraphNode } from "../types/graph";
import * as graphUtils from "../utils/graph";

cytoscape.use(coseBilkent);

type TooltipState = { visible: boolean; x: number; y: number; text: string };

const DEFAULT_URL = "https://example.com";

const CRAWL_CAP_PAGES = 1000;
const MAX_LINKS_PER_PAGE = 250;

function StatTile({
  label,
  value,
  suffix,
  icon,
  loading,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-secondary/40 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-text-muted">{icon}</div>
          <div className="text-xs font-medium text-text-muted truncate">{label}</div>
        </div>

        {loading ? <Loader2 className="h-4 w-4 animate-spin text-text-muted" /> : null}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-text-primary leading-none">{loading ? "—" : value}</div>
        {suffix ? <div className="text-xs text-text-secondary">{suffix}</div> : null}
      </div>
    </div>
  );
}

export function PageRankGraph() {
  const [searchParams] = useSearchParams();
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [url, setUrl] = useState(DEFAULT_URL);

  const [hopUI, setHopUI] = useState<1 | 2 | 3>(2);
  const [sameDomainOnlyUI, setSameDomainOnlyUI] = useState(false);

  const [appliedHop, setAppliedHop] = useState<1 | 2 | 3>(2);
  const [appliedSameDomainOnly, setAppliedSameDomainOnly] = useState(false);
  const [appliedSeedUrl, setAppliedSeedUrl] = useState(DEFAULT_URL);

  const [topK, setTopK] = useState<50 | 100 | 200 | 300 | 500 | 1000>(200);

  const [graphVersion, setGraphVersion] = useState(0);

  const [data, setData] = useState<GraphResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [graphBusy, setGraphBusy] = useState(false);
  const [error, setError] = useState("");

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, text: "" });

  const radialPushedForKeyRef = useRef<string>("");
  const runIdRef = useRef(0);

  const run = useCallback(
    async (nextUrl?: string) => {
      setError("");
      setIsLoading(true);

      setData(null);
      setSelectedNodeId(null);
      setTooltip({ visible: false, x: 0, y: 0, text: "" });

      const myRunId = ++runIdRef.current;

      try {
        const seedUrl = nextUrl ?? url;

        const json = await getPageRankGraph({
          url: seedUrl,
          max_hops: hopUI,
          max_pages: CRAWL_CAP_PAGES,
          same_domain_only: sameDomainOnlyUI,
        });

        if (myRunId !== runIdRef.current) return;

        setAppliedHop(hopUI);
        setAppliedSameDomainOnly(sameDomainOnlyUI);
        setAppliedSeedUrl(seedUrl);

        radialPushedForKeyRef.current = "";
        setData(json);
      } catch (e: any) {
        if (myRunId !== runIdRef.current) return;

        const msg =
          e?.response?.data?.detail ??
          e?.response?.data ??
          e?.message ??
          String(e);
        setError(typeof msg === "string" ? msg : JSON.stringify(msg, null, 2));
      } finally {
        if (myRunId !== runIdRef.current) return;
        setIsLoading(false);
      }
    },
    [url, hopUI, sameDomainOnlyUI]
  );

  useEffect(() => {
    const u = searchParams.get("url");
    const h = searchParams.get("hop");
    const k = searchParams.get("topK");

    if (u) setUrl(u);

    if (h === "1" || h === "2" || h === "3") {
      const parsedHop = Number(h) as 1 | 2 | 3;
      setHopUI(parsedHop);
    }

    if (k && ["50", "100", "200", "300", "500", "1000"].includes(k)) {
      setTopK(Number(k) as 50 | 100 | 200 | 300 | 500 | 1000);
    }

    if (u) run(u);
  }, []);

  const normalized = (s: string) => s.trim().replace(/\/+$/, "");

  const hasPendingRunChanges = useMemo(() => {
    return (
      normalized(url) !== normalized(appliedSeedUrl) ||
      hopUI !== appliedHop ||
      sameDomainOnlyUI !== appliedSameDomainOnly
    );
  }, [url, appliedSeedUrl, hopUI, appliedHop, sameDomainOnlyUI, appliedSameDomainOnly]);

  const filtered = useMemo(() => {
    if (!data) return null;

    const hopNodes: GraphNode[] = [];
    for (const n of data.nodes) if (n.depth <= appliedHop) hopNodes.push(n);

    const sorted = hopNodes.slice().sort((a, b) => b.pagerank - a.pagerank);

    const limit = Math.min(topK, sorted.length);
    const kept = sorted.slice(0, limit);

    const seedNode =
      hopNodes.find((n) => n.url === data.seed) ??
      hopNodes.find((n) => n.depth === 0) ??
      null;

    if (seedNode && !kept.some((n) => n.id === seedNode.id)) kept.unshift(seedNode);

    const keptIds = new Set<string>();
    for (const n of kept) keptIds.add(n.id);

    const keptEdges = data.edges.filter((e) => keptIds.has(e.source) && keptIds.has(e.target));

    return { seedUrl: data.seed, seedNode, nodes: kept, edges: keptEdges };
  }, [data, appliedHop, topK]);

  useEffect(() => {
    if (!filtered) return;
    setGraphBusy(true); 
    setGraphVersion((v) => v + 1);
    setSelectedNodeId(null);
    setTooltip({ visible: false, x: 0, y: 0, text: "" });
  }, [filtered]);

  const selectedNode = useMemo(() => {
    if (!filtered || !selectedNodeId) return null;
    return filtered.nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [filtered, selectedNodeId]);

  const prExtent = useMemo(() => {
    if (!filtered || filtered.nodes.length === 0) return { min: 0, max: 1 };
    let min = Infinity;
    let max = -Infinity;
    for (const n of filtered.nodes) {
      const pr = n.pagerank;
      if (pr < min) min = pr;
      if (pr > max) max = pr;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return { min: 0, max: 1 };
    return { min, max };
  }, [filtered]);

  const cyElements = useMemo(() => {
    if (!filtered) return [];

    const seedId = filtered.seedNode?.id ?? null;
    const seedDomainNorm = filtered.seedNode
      ? graphUtils.normalizeDomain(filtered.seedNode.domain, filtered.seedNode.url)
      : null;

    const nodeById = new Map<string, GraphNode>();
    for (const n of filtered.nodes) nodeById.set(n.id, n);

    const nodes = filtered.nodes.map((n) => {
      const domainNorm = graphUtils.normalizeDomain(n.domain, n.url);
      const isSeed = seedId != null && n.id === seedId;

      return {
        data: {
          id: n.id,
          url: n.url,
          short: graphUtils.readableLabel(n.url),
          domain: domainNorm,
          depth: n.depth,
          pagerank: n.pagerank,
          size: graphUtils.sizeByDepth(n.depth),
          color: graphUtils.domainToSafeColorHex(domainNorm, isSeed),
          border: isSeed ? "#000000" : graphUtils.domainToBorderHex(domainNorm),
          isSeed: isSeed ? 1 : 0,
          isSameDomainAsSeed: seedDomainNorm && domainNorm === seedDomainNorm ? 1 : 0,
        },
      };
    });

    const edges = filtered.edges.map((e, idx) => {
      const targetPr = nodeById.get(e.target)?.pagerank ?? 0;
      return {
        data: {
          id: `${e.source}->${e.target}-${idx}`,
          source: e.source,
          target: e.target,
          pr: targetPr,
        },
      };
    });

    return [...nodes, ...edges];
  }, [filtered]);

  const cyStylesheet = useMemo(() => {
    return [
      {
        selector: "node",
        style: {
          label: "",
          width: "data(size)",
          height: "data(size)",
          "background-color": "data(color)",
          "border-color": "data(border)",
          "border-width": 3,
          "background-opacity": 0.95,
        },
      },
      {
        selector: "node[isSeed = 1]",
        style: {
          "background-color": graphUtils.SEED_ORANGE,
          "border-color": "#000000",
          "border-width": 10,
        },
      },
      {
        selector: "edge",
        style: {
          width: `mapData(pr, ${prExtent.min}, ${prExtent.max}, 1, 8)`,
          opacity: 0.55,
          "curve-style": "bezier",
          "target-arrow-shape": "triangle",
          "arrow-scale": 0.85,
          "line-color": "#94A3B8",
          "target-arrow-color": "#94A3B8",
        },
      },
      {
        selector: "node:selected",
        style: {
          "border-color": "#111827",
          "border-width": 10,
        },
      },
      { selector: ".dimmed", style: { opacity: 0.15 } },
      { selector: ".emph", style: { opacity: 1.0 } },
    ];
  }, [prExtent]);

  const cyLayout = useMemo(
    () => ({
      name: "cose-bilkent",
      animate: true,
      animationDuration: 600,
      fit: true,
      padding: 120,
      nodeRepulsion: 180000,
      idealEdgeLength: 320,
      edgeElasticity: 0.22,
      gravity: 0.02,
      nestingFactor: 1.2,
      numIter: 2200,
      tile: true,
      randomize: true,
    }),
    []
  );

  const applyRadialDepthPush = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || !filtered || !filtered.seedNode) return;

    const key = `${filtered.seedUrl}|hop=${appliedHop}|topK=${topK}|nodes=${filtered.nodes.length}|edges=${filtered.edges.length}`;
    if (radialPushedForKeyRef.current === key) return;
    radialPushedForKeyRef.current = key;

    const seedEl = cy.getElementById(filtered.seedNode.id);
    if (!seedEl || seedEl.empty()) return;

    const center = seedEl.position();

    cy.nodes().forEach((node) => {
      const d = Number(node.data("depth") ?? 0);
      if (d <= 0) return;

      const p = node.position();
      const vx = p.x - center.x;
      const vy = p.y - center.y;
      const len = Math.sqrt(vx * vx + vy * vy) || 1;

      const push = graphUtils.radialFactorByDepth(d);
      node.position({
        x: p.x + (vx / len) * push,
        y: p.y + (vy / len) * push,
      });
    });

    cy.fit(undefined, 80);
  }, [filtered, appliedHop, topK]);

  const top20Full = useMemo(() => {
    if (!data) return [];
    return data.nodes.slice().sort((a, b) => b.pagerank - a.pagerank).slice(0, 20);
  }, [data]);

  const stats = useMemo(() => {
    return {
      crawlCap: CRAWL_CAP_PAGES,
      discoveredNodes: data?.nodes?.length ?? 0,
      visibleNodes: filtered?.nodes?.length ?? 0,
      visibleEdges: filtered?.edges?.length ?? 0,
    };
  }, [data, filtered]);

  const tileLoading = isLoading || graphBusy;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">PageRank Graph</h2>
        <p className="text-text-secondary mt-1">Seeded crawl + PageRank computed over the discovered subgraph.</p>
      </div>

      <Accordion title="How to read this graph" defaultOpen={false}>
        <div className="space-y-4 text-sm">
          <div className="text-text-secondary">
            This visualization is a <span className="font-medium text-text-primary">seeded PageRank</span>: the crawl starts at the
            provided <span className="font-medium text-text-primary">Seed URL</span> and discovers links outward up to the selected hop
            depth. PageRank is then computed over that discovered graph, so scores reflect importance{" "}
            <span className="font-medium text-text-primary">within the sampled subgraph</span>, not across the entire web.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="font-medium text-text-primary">Visual encodings</div>
              <ul className="list-disc pl-5 text-text-secondary space-y-1">
                <li>
                  <span className="font-medium text-text-primary">Layout:</span> force layout grows outward from the seed.
                </li>
                <li>
                  <span className="font-medium text-text-primary">Node size:</span> decreases with hop depth (seed is largest).
                </li>
                <li>
                  <span className="font-medium text-text-primary">Node color:</span> domain grouping (seed is the only orange node).
                </li>
                <li>
                  <span className="font-medium text-text-primary">Edges:</span> thickness encodes PageRank of the{" "}
                  <span className="font-medium text-text-primary">target</span> node.
                </li>
                <li>
                  <span className="font-medium text-text-primary">Interaction:</span> hover/click a node to see its URL; Top-20 items can
                  highlight nodes in the graph.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-medium text-text-primary">Sampling & limits (important)</div>
              <ul className="list-disc pl-5 text-text-secondary space-y-1">
                <li>
                  The crawl is capped by a <span className="font-medium text-text-primary">page limit</span> (max pages). If the cap is
                  reached early, deeper hops may not be fully explored.
                </li>
                <li>
                  Each page contributes at most <span className="font-medium text-text-primary">{MAX_LINKS_PER_PAGE}</span> extracted links,
                  so extremely link-heavy pages cannot dominate discovery.
                </li>
                <li>
                  Changing <span className="font-medium text-text-primary">Hops</span> or{" "}
                  <span className="font-medium text-text-primary">Same-domain only</span> changes the discovered graph, so it generally{" "}
                  <span className="font-medium text-text-primary">requires re-running</span>.
                </li>
                <li>
                  Changing <span className="font-medium text-text-primary">Top-N</span> only changes what subset is shown. You can reduce
                  nodes without re-running, but re-run is preferred if you want a cleaner sample.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Accordion>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full md:w-[520px]">
              <label className="text-sm font-medium text-text-secondary">Seed URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="mt-2 h-10 w-full rounded-lg border border-border-default bg-bg-secondary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Depth</label>
              <select
                value={hopUI}
                onChange={(e) => setHopUI(Number(e.target.value) as 1 | 2 | 3)}
                className="mt-2 h-10 rounded-lg border border-border-default bg-bg-secondary px-3 text-sm"
              >
                <option value={1}>1 hop</option>
                <option value={2}>2 hops</option>
                <option value={3}>3 hops</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Top-N (view)</label>
              <select
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value) as 50 | 100 | 200 | 300 | 500 | 1000)}
                className="mt-2 h-10 rounded-lg border border-border-default bg-bg-secondary px-3 text-sm"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-text-secondary mb-2 md:mb-0">
              <input type="checkbox" checked={sameDomainOnlyUI} onChange={(e) => setSameDomainOnlyUI(e.target.checked)} />
              same-domain only
            </label>

            <Button onClick={() => run()} disabled={isLoading} isLoading={isLoading}>
              Run
            </Button>
          </div>

          {hasPendingRunChanges && !isLoading ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-border-default bg-bg-secondary/40 px-3 py-2 text-xs text-text-secondary">
              <AlertCircle className="h-4 w-4 text-text-muted" />
              <span>
                Pending changes. <span className="font-medium text-text-primary">Run</span> to apply.
              </span>
            </div>
          ) : null}

          {error ? <div className="mt-4 text-sm text-error whitespace-pre-wrap break-words">{error}</div> : null}
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Crawl cap"
          value={stats.crawlCap}
          suffix="pages"
          icon={<Database className="h-4 w-4" />}
          loading={tileLoading}
        />
        <StatTile
          label="Discovered nodes"
          value={stats.discoveredNodes}
          icon={<Compass className="h-4 w-4" />}
          loading={tileLoading}
        />
        <StatTile
          label="Visible nodes"
          value={stats.visibleNodes}
          icon={<Eye className="h-4 w-4" />}
          loading={tileLoading}
        />
        <StatTile
          label="Visible edges"
          value={stats.visibleEdges}
          icon={<Link2 className="h-4 w-4" />}
          loading={tileLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">Graph</CardTitle>
          </CardHeader>
          <CardContent>
            {!filtered ? (
              <div className="relative text-sm text-text-muted min-h-[240px] flex items-center justify-center">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading graph…
                  </div>
                ) : (
                  "Run a crawl to see the graph."
                )}
              </div>
            ) : (
              <div className="relative h-[70vh] w-full rounded-lg border border-border-default overflow-hidden">
                {isLoading || graphBusy ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-secondary/50">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading…
                    </div>
                  </div>
                ) : null}

                <CytoscapeComponent
                  key={graphVersion}
                  elements={cyElements}
                  stylesheet={cyStylesheet}
                  layout={cyLayout}
                  style={{ width: "100%", height: "100%" }}
                  cy={(cy) => {
                    cyRef.current = cy;

                    cy.off("tap");
                    cy.off("mouseover");
                    cy.off("mousemove");
                    cy.off("mouseout");
                    cy.off("layoutstart");
                    cy.off("layoutstop");

                    cy.on("tap", "node", (evt) => {
                      const id = evt.target.id();
                      setSelectedNodeId(id);
                      graphUtils.focusNodeInGraph(cy, id);
                    });

                    cy.on("tap", (evt) => {
                      if (evt.target === cy) setSelectedNodeId(null);
                    });

                    cy.on("mouseover", "node", (evt) => {
                      const rp = evt.renderedPosition;
                      const text = evt.target.data("short") || evt.target.data("url") || "";
                      setTooltip({ visible: true, x: rp.x + 12, y: rp.y + 12, text });
                    });
                    cy.on("mousemove", "node", (evt) => {
                      const rp = evt.renderedPosition;
                      const text = evt.target.data("short") || evt.target.data("url") || "";
                      setTooltip({ visible: true, x: rp.x + 12, y: rp.y + 12, text });
                    });
                    cy.on("mouseout", "node", () => setTooltip((t) => (t.visible ? { ...t, visible: false } : t)));

                    cy.on("layoutstart", () => setGraphBusy(true));
                    cy.on("layoutstop", () => {
                      applyRadialDepthPush();
                      requestAnimationFrame(() => setGraphBusy(false));
                    });
                  }}
                />

                {tooltip.visible ? (
                  <div
                    className="pointer-events-none absolute z-20 max-w-[360px] rounded-md border border-border-default bg-bg-secondary/95 px-3 py-2 text-xs text-text-primary shadow"
                    style={{ left: tooltip.x, top: tooltip.y }}
                  >
                    {tooltip.text}
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedNode ? (
              <div className="text-sm text-text-muted">Click a node to see details.</div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-medium text-text-primary break-words">{selectedNode.url}</div>
                <div className="text-sm text-text-secondary">domain: {graphUtils.normalizeDomain(selectedNode.domain, selectedNode.url)}</div>
                <div className="text-sm text-text-secondary">depth: {selectedNode.depth}</div>
                <div className="text-sm text-text-secondary">pagerank: {selectedNode.pagerank.toFixed(6)}</div>
                <div className="pt-3">
                  <a href={selectedNode.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                    Open URL
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Top 20 by PageRank</CardTitle>
        </CardHeader>
        <CardContent>
          {!data ? (
            <div className="text-sm text-text-muted">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </span>
              ) : (
                "Run a crawl to see results."
              )}
            </div>
          ) : (
            <ol className="space-y-3 list-decimal pl-5">
              {top20Full.map((n) => (
                <li
                  key={n.id}
                  className="text-sm cursor-pointer"
                  onClick={() => {
                    setSelectedNodeId(n.id);
                    if (cyRef.current) graphUtils.focusNodeInGraph(cyRef.current, n.id);
                  }}
                >
                  <div className="text-text-primary break-words">{n.url}</div>
                  <div className="text-text-muted">
                    pr={n.pagerank.toFixed(6)} · depth={n.depth} · {graphUtils.normalizeDomain(n.domain, n.url)}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}