import { afterEach, describe, expect, it, vi } from "vitest";
import { getProjectExternalMeta } from "./service";
import { ERROR_TTL_MS } from "../data/cache-policy";
import { invalidateProjectsCache } from "../catalog";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const GITHUB_REPO = {
  full_name: "VeTwo-dev/units",
  private: false,
  html_url: "https://github.com/VeTwo-dev/units",
  stargazers_count: 2,
  forks_count: 0,
  open_issues_count: 1,
  pushed_at: "2026-10-01T00:00:00Z",
  default_branch: "main",
  license: null,
};

afterEach(() => {
  vi.unstubAllGlobals();
  invalidateProjectsCache();
});

describe("getProjectExternalMeta", () => {
  it("marks slugs without a verified mapping as unmapped (github: every slug IS mapped)", async () => {
    const spy = vi.fn(async () => jsonResponse({ error: "x" }, 404));
    vi.stubGlobal("fetch", spy);
    // feed-formulation has an editorial repo, so github is mapped; npm is not.
    const npm = await getProjectExternalMeta("feed-formulation", "npm");
    expect(npm).toMatchObject({ available: false, reason: "unmapped" });
    expect(spy).not.toHaveBeenCalled();
  });
  it("rejects unknown slugs without network calls", async () => {
    const spy = vi.fn(async () => jsonResponse(GITHUB_REPO));
    vi.stubGlobal("fetch", spy);
    const res = await getProjectExternalMeta("no-such-project", "npm");
    expect(res).toMatchObject({ available: false, reason: "unmapped" });
    expect(spy).not.toHaveBeenCalled();
  });
  it("serves fresh upstream data with cached provenance when no DB is configured", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(GITHUB_REPO)));
    const res = await getProjectExternalMeta("units", "github");
    expect(res.available).toBe(true);
    if (res.available) {
      expect(res.data).toMatchObject({ stars: 2, forks: 0 });
      expect(res.provenance).toMatchObject({ kind: "cached", source: "api.github.com" });
    }
  });
  it("serves stale-safe unavailable state when upstream fails and nothing is cached", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error: "x" }, 404)));
    const res = await getProjectExternalMeta("units", "github");
    expect(res).toMatchObject({ available: false, reason: "unavailable" });
  });
  it("never persists a failure as success: a later good fetch wins", async () => {
    const t0 = Date.now();
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error: "x" }, 500)));
    const failed = await getProjectExternalMeta("units", "github", t0);
    expect(failed.available).toBe(false);
    // Inside the error TTL the failure is (correctly) not retried...
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(GITHUB_REPO)));
    const suppressed = await getProjectExternalMeta("units", "github", t0 + 1000);
    expect(suppressed.available).toBe(false);
    // ...but past it, a good fetch recovers to success.
    const recovered = await getProjectExternalMeta("units", "github", t0 + ERROR_TTL_MS + 1000);
    expect(recovered.available).toBe(true);
    if (recovered.available) {
      expect(recovered.data).toMatchObject({ stars: 2 });
    }
  });
});
