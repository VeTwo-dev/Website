import { describe, expect, it } from "vitest";
import { ProjectSchema, ProjectQuerySchema } from "@/lib/projects/schema";
import { PROJECTS, getProject, searchProjects } from "@/lib/projects/data";

describe("ProjectSchema", () => {
  it("accepts a valid editorial record", () => {
    expect(() => ProjectSchema.parse(PROJECTS[0])).not.toThrow();
  });
  it("rejects invented-shape payloads (missing repository)", () => {
    expect(() =>
      ProjectSchema.parse({ ...PROJECTS[0], repository: "not-a-url" }),
    ).toThrow();
  });
  it("withholds unverified fields as null, never fabricates", () => {
    for (const p of PROJECTS) {
      if (p.slug === "whichenv") expect(p.license).toBeNull();
    }
  });
});

describe("ProjectQuerySchema", () => {
  it("rejects abusive limit values", () => {
    expect(() => ProjectQuerySchema.parse({ q: "", limit: 999 })).toThrow();
  });
  it("rejects oversized queries", () => {
    expect(() => ProjectQuerySchema.parse({ q: "x".repeat(101) })).toThrow();
  });
});

describe("catalog selectors", () => {
  it("finds by slug", () => {
    expect(getProject("units")?.name).toBe("units");
    expect(getProject("nope")).toBeUndefined();
  });
  it("searches name/description case-insensitively", () => {
    expect(searchProjects("dimensional").map((p) => p.slug)).toContain("units");
    expect(searchProjects("").length).toBe(PROJECTS.length);
  });
  it("filters by category", () => {
    const dev = searchProjects("", "DeveloperTool", "all");
    expect(dev.length).toBeGreaterThan(0);
    expect(dev.every((p) => p.category === "DeveloperTool")).toBe(true);
  });
});
