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

afterEach(() => {
  vi.unstubAllGlobals();
  invalidateProjectsCache();
});

describe("GET /api/v1/public/packages", () => {
  it("returns one entry per verified mapping with safe fields only", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          name: "@vetwo/units",
          "dist-tags": { latest: "1.0.0" },
        }),
      ),
    );
    const res = await GET(new Request("https://vetwo.dev/api/v1/public/packages"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain(`max-age=${CACHE_TTL_SECONDS}`);
    const body = await res.json();
    expect(body.meta.count).toBe(body.data.length);
    expect(body.data.length).toBeGreaterThan(0);
    const slugs = body.data.map((d: { slug: string }) => d.slug);
    // unmapped slugs never appear
    expect(slugs).not.toContain("docs");
    expect(slugs).not.toContain("cli-sound");
    const flat = JSON.stringify(body);
    expect(flat).not.toContain("GITHUB_TOKEN");
    expect(flat).not.toContain("_id");
  });
});
