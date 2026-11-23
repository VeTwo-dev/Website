import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { CACHE_TTL_SECONDS } from "@/lib/data/cache-policy";
import { invalidateProjectsCache } from "@/lib/catalog";

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

const NPM_DOC = {
  name: "@vetwo/units",
  description: "units engine",
  license: "MIT",
  "dist-tags": { latest: "1.0.0" },
  time: { "1.0.0": "2026-09-01T00:00:00.000Z" },
};

afterEach(() => {
  vi.unstubAllGlobals();
  invalidateProjectsCache();
});

describe("GET /api/v1/public/projects/[slug]", () => {
  it("returns 404 for unknown slugs without upstream calls", async () => {
    const spy = vi.fn(async () => jsonResponse({}));
    vi.stubGlobal("fetch", spy);
    const res = await GET(new Request("https://vetwo.dev/api/v1/public/projects/nope"), {
      params: Promise.resolve({ slug: "nope" }),
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
    expect(spy).not.toHaveBeenCalled();
  });
  it("returns 400 for malformed slugs", async () => {
    const res = await GET(new Request("https://vetwo.dev/api/v1/public/projects/x"), {
      params: Promise.resolve({ slug: "../etc" }),
    });
    expect(res.status).toBe(400);
  });
  it("returns editorial + external views with safe fields only", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => jsonResponse(url.includes("api.github.com") ? GITHUB_REPO : NPM_DOC)),
    );
    const res = await GET(new Request("https://vetwo.dev/api/v1/public/projects/units"), {
      params: Promise.resolve({ slug: "units" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain(`max-age=${CACHE_TTL_SECONDS}`);
    const body = await res.json();
    expect(body.data.project.slug).toBe("units");
    expect(body.data.github).toMatchObject({ available: true });
    expect(body.data.npm).toMatchObject({ available: true });
    expect(JSON.stringify(body)).not.toContain("GITHUB_TOKEN");
    expect(JSON.stringify(body)).not.toContain("_id");
  });
  it("marks unmapped npm slugs honestly (docs has no verified package)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(GITHUB_REPO)));
    const res = await GET(new Request("https://vetwo.dev/api/v1/public/projects/docs"), {
      params: Promise.resolve({ slug: "docs" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.npm).toMatchObject({ available: false, reason: "unmapped" });
  });
});
