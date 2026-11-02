import { describe, expect, it } from "vitest";
import {
  GITHUB_OWNER,
  assertUniqueSlugs,
  editorialRepoMap,
  isValidSlug,
  normalizeSlug,
  parseGitHubRef,
} from "./identity";
import { PROJECTS } from "./data";

describe("normalizeSlug", () => {
  it("lowercases, trims, and collapses separators", () => {
    expect(normalizeSlug("  Feed_Formulation ")).toBe("feed-formulation");
    expect(normalizeSlug("Repo--Fetch")).toBe("repo-fetch");
  });
  it("strips unsafe characters", () => {
    expect(normalizeSlug("../../etc")).toBe("etc");
  });
});

describe("isValidSlug", () => {
  it("accepts canonical slugs", () => {
    expect(isValidSlug("units")).toBe(true);
    expect(isValidSlug("feed-formulation")).toBe(true);
  });
  it("rejects traversal, spaces, and empties", () => {
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("../x")).toBe(false);
    expect(isValidSlug("has space")).toBe(false);
  });
});

describe("assertUniqueSlugs", () => {
  it("passes for the editorial catalog", () => {
    expect(() => assertUniqueSlugs(PROJECTS.map((p) => p.slug))).not.toThrow();
  });
  it("throws on duplicates instead of merging", () => {
    expect(() => assertUniqueSlugs(["units", "units"])).toThrow(/duplicate project slug/);
  });
});

describe("parseGitHubRef", () => {
  it("parses owner/repo from https URLs", () => {
    expect(parseGitHubRef("https://github.com/VeTwo-dev/units")).toEqual({ owner: "VeTwo-dev", repo: "units" });
  });
  it("rejects non-GitHub hosts and malformed input without throwing", () => {
    expect(parseGitHubRef("https://example.com/x")).toBeNull();
    expect(parseGitHubRef("http://github.com/VeTwo-dev/units")).toBeNull();
    expect(parseGitHubRef("not a url")).toBeNull();
  });
});

describe("editorialRepoMap", () => {
  it("maps every editorial slug to a VeTwo-dev repo (no silent remapping)", () => {
    const map = editorialRepoMap();
    expect(GITHUB_OWNER).toBe("VeTwo-dev");
    expect(map.size).toBe(PROJECTS.length);
    for (const p of PROJECTS) {
      expect(map.get(p.slug)).toBeTruthy();
    }
  });
});
