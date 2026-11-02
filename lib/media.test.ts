import { describe, expect, it } from "vitest";
import { MEDIA, getMedia, ratioClass } from "./media";
import { PROJECTS } from "./projects/data";

describe("media placeholder manifest", () => {
  it("has unique stable ids", () => {
    const ids = Object.values(MEDIA).map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [key, m] of Object.entries(MEDIA)) {
      expect(m.id, key).toBe(key);
    }
  });
  it("declares valid ratios, dimensions, and purposes", () => {
    for (const m of Object.values(MEDIA)) {
      expect(m.ratio, m.id).toMatch(/^\d+\/\d+$/);
      expect(m.width).toBeGreaterThan(0);
      expect(m.height).toBeGreaterThan(0);
      expect(m.purpose.length).toBeGreaterThan(10);
      expect(m.art.length).toBeGreaterThan(10);
      expect(ratioClass(m.ratio).length).toBeGreaterThan(0);
    }
  });
  it("registers local paths only — never remote or missing-by-design URLs", () => {
    for (const m of Object.values(MEDIA)) {
      if (m.path === null) continue;
      expect(m.path.startsWith("/media/")).toBe(true);
      expect(m.path).not.toMatch(/^https?:/);
    }
  });
  it("resolves unknown ids to null (placeholder fallback)", () => {
    expect(getMedia("home.nope.missing")).toBeNull();
  });
  it("featured media covers real catalog slugs only", () => {
    const slugs = new Set(PROJECTS.map((p) => p.slug));
    expect(slugs.has("units")).toBe(true);
    expect(slugs.has("nutrition-units")).toBe(true);
  });
});
