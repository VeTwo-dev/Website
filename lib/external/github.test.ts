import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGitHubRepoMeta } from "./github";

function jsonResponse(body: unknown, status = 200, contentType = "application/json"): Response {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "content-type": contentType },
  });
}

const REPO = {
  full_name: "VeTwo-dev/units",
  private: false,
  html_url: "https://github.com/VeTwo-dev/units",
  stargazers_count: 3,
  forks_count: 1,
  open_issues_count: 0,
  pushed_at: "2026-10-01T00:00:00Z",
  default_branch: "main",
  license: { spdx_id: "MIT" },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchGitHubRepoMeta", () => {
  it("maps the allow-listed allow-list shape (zero stays zero)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(REPO)));
    const res = await fetchGitHubRepoMeta("units");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.meta.stars).toBe(3);
      expect(res.meta.openIssues).toBe(0);
      expect(res.meta.license).toBe("MIT");
    }
  });
  it("normalizes NOASSERTION licenses to null (unknown, not a value)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ...REPO, license: { spdx_id: "NOASSERTION" } })));
    const res = await fetchGitHubRepoMeta("units");
    expect(res.ok && res.meta.license).toBeNull();
  });
  it("treats private repos as not_public, never leaking metrics", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ...REPO, private: true })));
    const res = await fetchGitHubRepoMeta("units");
    expect(res).toEqual({ ok: false, failure: { kind: "not_public" } });
  });
  it("surfaces 404 and rate limits as failures, not data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ message: "Not Found" }, 404)));
    expect(await fetchGitHubRepoMeta("nope")).toEqual({ ok: false, failure: { kind: "http", status: 404 }, status: 404 });
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ message: "limited" }, 429)));
    expect(await fetchGitHubRepoMeta("units")).toEqual({ ok: false, failure: { kind: "http", status: 429 }, status: 429 });
  });
  it("rejects malformed shapes, non-JSON, and bad repo names", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ nope: true })));
    expect((await fetchGitHubRepoMeta("units")).ok).toBe(false);
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse("<html>", 200, "text/html")));
    expect((await fetchGitHubRepoMeta("units")).ok).toBe(false);
    const spy = vi.fn(async () => jsonResponse(REPO));
    vi.stubGlobal("fetch", spy);
    expect(await fetchGitHubRepoMeta("../../etc")).toEqual({ ok: false, failure: { kind: "invalid" } });
    expect(spy).not.toHaveBeenCalled();
  });
  it("accepts +json content types (e.g. npm corgi docs)", async () => {
    const { fetchJsonCapped } = await import("./github");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(REPO), { status: 200, headers: { "content-type": "application/vnd.npm.install-v1+json" } })),
    );
    const res = await fetchJsonCapped("https://registry.npmjs.org/x");
    expect(res.ok).toBe(true);
  });
  it("maps timeouts to a timeout failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const e = new Error("timed out");
        e.name = "TimeoutError";
        throw e;
      }),
    );
    expect(await fetchGitHubRepoMeta("units")).toEqual({ ok: false, failure: { kind: "timeout" } });
  });
});
