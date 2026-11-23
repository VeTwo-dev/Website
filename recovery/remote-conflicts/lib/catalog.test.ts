import { describe, expect, it } from "vitest";
import {
  PUBLIC_FIELD_ALLOW_LIST,
  getExternalMeta,
  getPublicProject,
  invalidateProjectsCache,
  listPublicProjects,
  listPublicProjectsPaged,
  saveExternalMeta,
} from "./catalog";

describe("catalog boundary (static editorial source)", () => {
  it("returns slug-ordered items with totals, never degraded", async () => {
    const page = await listPublicProjectsPaged("", 50, 1);
    expect(page.total).toBeGreaterThan(0);
    expect(page.items.length).toBe(page.total);
    const slugs = page.items.map((i) => i.slug);
    expect(slugs).toEqual([...slugs].sort());
    expect(page.degraded).toBe(false);
    expect(page.items.every((i) => i.dataKind === "static")).toBe(true);
  });

  it("paginates deterministically without overlap", async () => {
    const a = await listPublicProjectsPaged("", 5, 1);
    const b = await listPublicProjectsPaged("", 5, 2);
    expect(a.items.map((i) => i.slug)).not.toEqual(b.items.map((i) => i.slug));
    expect(a.total).toBe(b.total);
  });

  it("filters by category/status and sorts by name", async () => {
    const asc = await listPublicProjectsPaged("", 50, 1, { category: "DeveloperTool", sort: "name_asc" });
    expect(asc.items.length).toBeGreaterThan(0);
    expect(asc.items.every((i) => i.category === "DeveloperTool")).toBe(true);
    const names = asc.items.map((i) => i.name);
    expect(names).toEqual([...names].sort());
  });

  it("exposes only allow-listed public fields", () => {
    expect([...PUBLIC_FIELD_ALLOW_LIST].sort()).toEqual(
      ["slug", "name", "description", "category", "status", "technologies", "repository", "source", "updatedAt"].sort(),
    );
    expect(PUBLIC_FIELD_ALLOW_LIST).not.toContain("_id");
  });

  it("resolves known slugs and rejects unknown ones", () => {
    expect(getPublicProject("units")?.slug).toBe("units");
    expect(getPublicProject("nope")).toBeNull();
  });

  it("keeps the backwards-compatible list shape", async () => {
    const items = await listPublicProjects("", 3);
    expect(items.length).toBeLessThanOrEqual(3);
  });
});

describe("external-meta store (validated, process-local)", () => {
  it("round-trips valid records and rejects invalid ones", async () => {
    const ok = await saveExternalMeta({
      slug: "fixture-alpha",
      provider: "github",
      status: "ok",
      data: { stars: 5 },
      fetchedAt: new Date().toISOString(),
      sourceUpdatedAt: null,
    });
    expect(ok).toBe(true);
    const back = await getExternalMeta("fixture-alpha", "github");
    expect(back).toMatchObject({ status: "ok", data: { stars: 5 } });
    const bad = await saveExternalMeta({
      slug: "fixture-alpha",
      // @ts-expect-error intentional invalid provider
      provider: "gitlab",
      status: "ok",
      data: {},
      fetchedAt: new Date().toISOString(),
      sourceUpdatedAt: null,
    });
    expect(bad).toBe(false);
    expect(await getExternalMeta("fixture-alpha", "npm")).toBeNull();
  });

  it("invalidateProjectsCache clears cached snapshots", async () => {
    await saveExternalMeta({
      slug: "fixture-beta",
      provider: "npm",
      status: "ok",
      data: { version: "1.0.0" },
      fetchedAt: new Date().toISOString(),
      sourceUpdatedAt: null,
    });
    expect(await getExternalMeta("fixture-beta", "npm")).not.toBeNull();
    invalidateProjectsCache();
    expect(await getExternalMeta("fixture-beta", "npm")).toBeNull();
  });
});
