import { describe, expect, it } from "vitest";
import { buildIndex, searchIndex } from "./index";
import { ARTICLES } from "../docs/content";
import { PROJECTS } from "../projects/data";

describe("local search index", () => {
  it("covers every project and every article", () => {
    for (const locale of ["en", "ar"] as const) {
      const idx = buildIndex(locale);
      expect(idx.length).toBe(PROJECTS.length + ARTICLES.length);
      for (const p of PROJECTS) {
        expect(idx.some((e) => e.id === `project:${p.slug}`)).toBe(true);
      }
    }
  });
  it("finds by title substring in both languages", () => {
    expect(searchIndex(buildIndex("en"), "unit").length).toBeGreaterThan(0);
    const ar = searchIndex(buildIndex("ar"), "مشاريع");
    expect(Array.isArray(ar)).toBe(true);
  });
  it("requires at least 2 characters and bounds results", () => {
    const idx = buildIndex("en");
    expect(searchIndex(idx, "a")).toEqual([]);
    expect(searchIndex(idx, "  ")).toEqual([]);
    expect(searchIndex(idx, "e", 3).length).toBeLessThanOrEqual(3);
  });
  it("links directly to real routes", () => {
    const hits = searchIndex(buildIndex("en"), "whichenv");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.href).toMatch(/^\/(en)\/(projects|docs)\//);
  });
});
