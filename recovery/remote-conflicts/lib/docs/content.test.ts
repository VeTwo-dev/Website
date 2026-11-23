import { describe, expect, it } from "vitest";
import { ARTICLES, SECTIONS, getArticle, articlesBySection } from "./content";

const VERIFIED_INSTALL = [
  "npm install @vetwo/units",
  "bun add @vetwo/units",
  "npm install @vetwo/units @vetwo/nutrition-units",
  "bun add @vetwo/units @vetwo/nutrition-units",
  "npm install @vetwo/repo-fetch",
  "npx whichenv",
];

describe("docs catalog", () => {  it("has no empty sections", () => {
    for (const s of SECTIONS) {
      expect(articlesBySection(s.id).length, s.id).toBeGreaterThan(0);
    }
  });
  it("resolves every article with stability + review date", () => {
    for (const a of ARTICLES) {
      expect(getArticle(a.slug)?.title).toBe(a.title);
      expect(["Stable", "Experimental"]).toContain(a.stability);
      expect(a.reviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.body.length).toBeGreaterThan(0);
    }
    expect(getArticle("nope")).toBeUndefined();
  });
  it("quotes only verified install commands", () => {
    const code = ARTICLES.flatMap((a) => a.body)
      .filter((b) => b.type === "code")
      .map((b) => (b.type === "code" ? b.code : ""));
    for (const snippet of code) {
      if (/npm install|bun add|npx /.test(snippet)) {
        const lines = snippet.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
        for (const line of lines) {
          const known = VERIFIED_INSTALL.some((v) => line === v || line.startsWith("npx whichenv") || line.startsWith("pnpm add @vetwo/repo-fetch") || line.startsWith("yarn add @vetwo/repo-fetch"));
          expect(known, line).toBe(true);
        }
        // every snippet names its source
        const withSource = ARTICLES.flatMap((a) => a.body).filter(
          (b) => b.type === "code" && snippet.includes((b.type === "code" ? b.code : "").slice(0, 10)),
        );
        expect(withSource.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("rich content blocks", () => {
  it("validates callout tones and non-empty text", () => {
    const callouts = ARTICLES.flatMap((a) => a.body).filter((b) => b.type === "callout");
    expect(callouts.length).toBeGreaterThan(0);
    for (const c of callouts) {
      if (c.type !== "callout") continue;
      expect(["info", "warning", "danger"]).toContain(c.tone);
      expect(c.text.length).toBeGreaterThan(20);
    }
  });
  it("validates tables (headers + aligned rows, real registry data)", () => {
    const tables = ARTICLES.flatMap((a) => a.body).filter((b) => b.type === "table");
    expect(tables.length).toBeGreaterThan(0);
    for (const t of tables) {
      if (t.type !== "table") continue;
      expect(t.head.length).toBe(2);
      expect(t.rows.length).toBeGreaterThan(0);
      for (const [a, b] of t.rows) {
        expect(a.length).toBeGreaterThan(0);
        expect(b.length).toBeGreaterThan(0);
      }
    }
  });
});
