import { describe, expect, it } from "vitest";
import { buildGraph, layoutGraph, VERIFIED_EDGES } from "./graph";
import { PROJECTS } from "../projects/data";

describe("ecosystem graph", () => {
  it("exposes exactly the three manifest-verified runtime edges", () => {
    const runtime = VERIFIED_EDGES.filter((e) => e.kind === "runtime");
    expect(runtime).toHaveLength(3);
    const pairs = runtime.map((e) => `${e.from}>${e.to}`).sort();
    expect(pairs).toEqual([
      "create-vetwo-pack>whichenv",
      "marketplace-fetch-pack>repo-fetch",
      "nutrition-units>units",
    ]);
    for (const e of runtime) {
      expect(e.range).toMatch(/^\^/);
      expect(e.evidence.length).toBeGreaterThan(10);
    }
  });
  it("labels the application edge conceptual, never a dependency", () => {
    const conceptual = VERIFIED_EDGES.filter((e) => e.kind === "conceptual");
    expect(conceptual).toHaveLength(1);
    expect(conceptual[0]?.range).toBeNull();
  });
  it("builds one node per project with registry-backed kinds", () => {
    const { nodes, edges } = buildGraph();
    expect(nodes).toHaveLength(PROJECTS.length);
    expect(edges).toHaveLength(VERIFIED_EDGES.length);
    const bySlug = new Map(nodes.map((n) => [n.slug, n]));
    expect(bySlug.get("units")?.kind).toBe("package");
    expect(bySlug.get("docs")?.kind).toBe("repository");
    // every edge endpoint resolves; no duplicates
    const slugs = new Set(nodes.map((n) => n.slug));
    for (const e of edges) {
      expect(slugs.has(e.from)).toBe(true);
      expect(slugs.has(e.to)).toBe(true);
    }
  });
  it("lays out deterministically within bounds", () => {
    const { nodes } = buildGraph();
    const a = layoutGraph(nodes, 900, 520);
    const b = layoutGraph(nodes, 900, 520);
    expect(a.size).toBe(nodes.length);
    for (const [slug, pos] of a) {
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThanOrEqual(900);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeLessThanOrEqual(520);
      expect(b.get(slug)).toEqual(pos);
    }
  });
});
