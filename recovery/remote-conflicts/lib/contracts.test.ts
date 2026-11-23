import { describe, expect, it } from "vitest";
import { PROJECTS } from "./projects/data";
import { editorialRepoMap } from "./projects/identity";
import { NPM_PACKAGE_MAP } from "./external/npm";
import { ARTICLES, DOC_RESOURCES, getArticle } from "./docs/content";
import { buildGraph } from "./ecosystem/graph";
import { buildIndex } from "./search/index";

const SLUGS = new Set(PROJECTS.map((p) => p.slug));
const ARTICLE_SLUGS = new Set(ARTICLES.map((a) => a.slug));

describe("cross-system slug contracts", () => {
  it("every npm mapping, repo mapping, and resource link resolves to a real project", () => {
    for (const slug of [...Object.keys(NPM_PACKAGE_MAP), ...editorialRepoMap().keys(), ...Object.keys(DOC_RESOURCES)]) {
      expect(SLUGS.has(slug), slug).toBe(true);
    }
    for (const docs of Object.values(DOC_RESOURCES)) {
      for (const doc of docs) {
        expect(ARTICLE_SLUGS.has(doc), doc).toBe(true);
        expect(getArticle(doc)).toBeTruthy();
      }
    }
  });
  it("graph nodes cover the catalog exactly once", () => {
    const { nodes } = buildGraph();
    expect(new Set(nodes.map((n) => n.slug)).size).toBe(PROJECTS.length);
    for (const p of PROJECTS) {
      expect(nodes.some((n) => n.slug === p.slug)).toBe(true);
    }
  });
  it("search index links resolve to existing routes", () => {
    for (const locale of ["en", "ar"] as const) {
      for (const e of buildIndex(locale)) {
        if (e.kind === "project") {
          const slug = e.id.replace("project:", "");
          expect(SLUGS.has(slug), e.id).toBe(true);
        } else {
          const slug = e.id.replace("doc:", "");
          expect(ARTICLE_SLUGS.has(slug), e.id).toBe(true);
        }
      }
    }
  });
});
