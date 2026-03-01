import type cytoscape from "cytoscape";

export const SEED_ORANGE = "#F59E0B";

export function normalizeDomainFromUrl(url: string): string {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h.startsWith("www.") ? h.slice(4) : h;
  } catch {
    return "";
  }
}

export function normalizeDomain(domain: string, urlFallback: string): string {
  const raw = (domain ?? "").trim().toLowerCase();
  const base = raw.length ? raw : normalizeDomainFromUrl(urlFallback);
  const noWww = base.startsWith("www.") ? base.slice(4) : base;
  const noPort = noWww.split(":")[0];
  return noPort;
}

export function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = (h % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));

  let r1 = 0, g1 = 0, b1 = 0;
  if (0 <= hh && hh < 1) [r1, g1, b1] = [c, x, 0];
  else if (1 <= hh && hh < 2) [r1, g1, b1] = [x, c, 0];
  else if (2 <= hh && hh < 3) [r1, g1, b1] = [0, c, x];
  else if (3 <= hh && hh < 4) [r1, g1, b1] = [0, x, c];
  else if (4 <= hh && hh < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  const m = l - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function domainToBorderHex(domainNorm: string) {
  const hue = hashHue(domainNorm || "unknown");
  return hslToHex(hue, 85, 22);
}

// --- seed-only orange enforcement ---
function hexToHue(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;

  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;

  if (d === 0) return 0;

  let hue = 0;
  if (mx === r) hue = ((g - b) / d) % 6;
  else if (mx === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return hue;
}

const SEED_ORANGE_HUE = hexToHue(SEED_ORANGE);
const ORANGE_BAND = 18;

export function domainToSafeColorHex(domainNorm: string, isSeed: boolean) {
  if (isSeed) return SEED_ORANGE;

  let hue = hashHue(domainNorm || "unknown");
  const diff = Math.abs(hue - SEED_ORANGE_HUE);
  const delta = Math.min(diff, 360 - diff);

  if (delta <= ORANGE_BAND) hue = (hue + 60) % 360;
  return hslToHex(hue, 85, 55);
}

export function readableLabel(u: string) {
  try {
    const x = new URL(u);
    const host = x.hostname;
    const parts = x.pathname.split("/").filter(Boolean);
    const last = parts.length ? parts[parts.length - 1] : "";
    const out = `${host}${last ? `/…/${last}` : ""}`;
    return out.length > 80 ? `${out.slice(0, 80)}…` : out;
  } catch {
    return u.length > 80 ? `${u.slice(0, 80)}…` : u;
  }
}

export function sizeByDepth(depth: number) {
  if (depth <= 0) return 78;
  if (depth === 1) return 54;
  if (depth === 2) return 40;
  return 32;
}

export function radialFactorByDepth(depth: number) {
  if (depth <= 0) return 0;
  if (depth === 1) return 80;
  if (depth === 2) return 170;
  return 250;
}

export function focusNodeInGraph(
  cy: cytoscape.Core,
  nodeId: string,
  options?: {
    zoom?: number;
    animationDuration?: number;
  }
) {
  if (!cy) return;

  const { zoom = 1.2, animationDuration = 300 } = options ?? {};

  cy.elements().removeClass("dimmed");
  cy.elements().removeClass("emph");

  const node = cy.getElementById(nodeId);
  if (!node || node.empty()) return;

  cy.$("node").unselect();
  node.select();

  const neighborhood = node.closedNeighborhood();

  cy.elements().addClass("dimmed");
  neighborhood.removeClass("dimmed");
  neighborhood.addClass("emph");

  cy.animate(
    {
      center: { eles: node },
      zoom: Math.max(cy.zoom(), zoom),
      duration: animationDuration,
    },
    { queue: false }
  );
}