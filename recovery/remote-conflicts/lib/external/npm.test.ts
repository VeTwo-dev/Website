import { afterEach, describe, expect, it, vi } from "vitest";
import { NPM_PACKAGE_MAP, fetchNpmPackageMeta } from "./npm";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const DOC = {
  name: "@vetwo/units",
  description: "units engine",
  license: "MIT",
  "dist-tags": { latest: "1.0.0" },
  time: { "1.0.0": "2026-09-01T00:00:00.000Z" },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NPM_PACKAGE_MAP", () => {
  it("contains only verified published packages", () => {
    expect(NPM_PACKAGE_MAP).toEqual({
      units: "@vetwo/units",
      "nutrition-units": "@vetwo/nutrition-units",
      whichenv: "@vetwo/whichenv",
      "repo-fetch": "@vetwo/repo-fetch",
      "create-vetwo-pack": "create-vetwo-pack",
    });
    expect(NPM_PACKAGE_MAP["docs"]).toBeUndefined();
    expect(NPM_PACKAGE_MAP["feed-formulation"]).toBeUndefined();
    // Unscoped cli-sound on npm is not verifiably VeTwo's — must stay unmapped.
    expect(NPM_PACKAGE_MAP["cli-sound"]).toBeUndefined();
  });
});

describe("fetchNpmPackageMeta", () => {
  it("maps version + publication time from the abbreviated doc", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(DOC)));
    const res = await fetchNpmPackageMeta("@vetwo/units");
    expect(res).toEqual({
      ok: true,
      meta: {
        name: "@vetwo/units",
        version: "1.0.0",
        registryUrl: "https://www.npmjs.com/package/@vetwo/units",
        publishedAt: "2026-09-01T00:00:00.000Z",
        license: "MIT",
      },
    });
  });
  it("treats missing packages as failures, never zero-version data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error: "Not found" }, 404)));
    expect(await fetchNpmPackageMeta("@vetwo/docs")).toEqual({
      ok: false,
      failure: { kind: "http", status: 404 },
      status: 404,
    });
  });
  it("rejects invalid package names without any network call", async () => {
    const spy = vi.fn(async () => jsonResponse(DOC));
    vi.stubGlobal("fetch", spy);
    expect((await fetchNpmPackageMeta("https://evil.example/x")).ok).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });
});
