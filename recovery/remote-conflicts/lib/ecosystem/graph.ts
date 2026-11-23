import { PROJECTS } from "../projects/data";
import { NPM_PACKAGE_MAP } from "../external/npm";

/**
 * Ecosystem graph model. Edges exist ONLY with explicit evidence:
 * - "runtime": manifest `dependencies` entry (verified 2026-10-09/12 from
 *   raw.githubusercontent.com package.json files, main branch).
 * - "conceptual": documented architectural layering (org README), labeled
 *   as such and never rendered as a dependency.
 */

export type EdgeKind = "runtime" | "conceptual";

export type GraphEdge = {
  from: string;
  to: string;
  kind: EdgeKind;
  /** Version range from the dependent's manifest (runtime edges only). */
  range: string | null;
  evidence: string;
};

export const VERIFIED_EDGES: GraphEdge[] = [
  {
    from: "nutrition-units",
    to: "units",
    kind: "runtime",
    range: "^0.0.1",
    evidence: "nutrition-units/package.json dependencies + README domain-layer statement",
  },
  {
    from: "marketplace-fetch-pack",
    to: "repo-fetch",
    kind: "runtime",
    range: "^1.0.0",
    evidence: "marketplace-fetch-pack/package.json dependencies (@vetwo/repo-fetch)",
  },
  {
    from: "create-vetwo-pack",
    to: "whichenv",
    kind: "runtime",
    range: "^1.0.0",
    evidence: "Create-VeTwo-Pack/package.json dependencies (@vetwo/whichenv)",
  },
  {
    from: "feed-formulation",
    to: "nutrition-units",
    kind: "conceptual",
    range: null,
    evidence: "Org profile lists Feed-Formulation as the nutrition application layer; no manifest dependency observed",
  },
];

export type NodeKind = "package" | "repository";

export type GraphNode = {
  slug: string;
  name: string;
  category: string;
  kind: NodeKind;
  publishedAs: string | null;
  /** Layer column for the deterministic layout (0 = foundation). */
  layer: number;
};

const LAYER: Record<string, number> = {
  units: 0,
  "repo-fetch": 0,
  whichenv: 0,
  "nutrition-units": 1,
  "marketplace-fetch-pack": 1,
  "create-vetwo-pack": 1,
  "cli-sound": 1,
  docs: 1,
  "feed-formulation": 2,
  "vetwo-market-place": 2,
  "units-manager": 2,
  cli: 2,
};

export function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const slugs = new Set(PROJECTS.map((p) => p.slug));
  for (const e of VERIFIED_EDGES) {
    if (!slugs.has(e.from) || !slugs.has(e.to)) {
      throw new Error(`graph edge references unknown slug: ${e.from} -> ${e.to}`);
    }
  }
  const seen = new Set(VERIFIED_EDGES.map((e) => `${e.from}>${e.to}`));
  if (seen.size !== VERIFIED_EDGES.length) throw new Error("duplicate graph edge");
  const nodes: GraphNode[] = PROJECTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    kind: NPM_PACKAGE_MAP[p.slug] ? "package" : "repository",
    publishedAs: NPM_PACKAGE_MAP[p.slug] ?? null,
    layer: LAYER[p.slug] ?? 2,
  }));
  return { nodes, edges: VERIFIED_EDGES };
}

export type RelatedLink = {
  slug: string;
  /** "depends-on" = this project needs the other; "required-by" = reverse. */
  relation: "depends-on" | "required-by" | "conceptual";
  kind: EdgeKind;
  range: string | null;
  evidence: string;
};

/** Verified relationships touching a slug, both directions, deduplicated. */
export function relatedSlugs(slug: string): RelatedLink[] {
  const out: RelatedLink[] = [];
  for (const e of VERIFIED_EDGES) {
    if (e.from === slug) {
      out.push({
        slug: e.to,
        relation: e.kind === "runtime" ? "depends-on" : "conceptual",
        kind: e.kind,
        range: e.range,
        evidence: e.evidence,
      });
    } else if (e.to === slug) {
      out.push({
        slug: e.from,
        relation: e.kind === "runtime" ? "required-by" : "conceptual",
        kind: e.kind,
        range: e.range,
        evidence: e.evidence,
      });
    }
  }
  return out;
}
export function layoutGraph(
  nodes: GraphNode[],
  width = 900,
  height = 520,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const layers = new Map<number, GraphNode[]>();
  for (const n of [...nodes].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const list = layers.get(n.layer) ?? [];
    list.push(n);
    layers.set(n.layer, list);
  }
  const layerIds = [...layers.keys()].sort((a, b) => a - b);
  layerIds.forEach((id, col) => {
    const list = layers.get(id) ?? [];
    const x = layerIds.length === 1 ? width / 2 : 90 + (col * (width - 180)) / (layerIds.length - 1);
    list.forEach((n, row) => {
      const y = list.length === 1 ? height / 2 : 60 + (row * (height - 120)) / (list.length - 1);
      positions.set(n.slug, { x, y });
    });
  });
  return positions;
}
