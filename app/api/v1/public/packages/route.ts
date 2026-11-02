import { NextResponse } from "next/server";
import { getProjectExternalMeta } from "@/lib/external/service";
import { PUBLIC_API_CACHE_CONTROL } from "@/lib/data/cache-policy";
import { NPM_PACKAGE_MAP } from "@/lib/external/npm";
import { PROJECTS } from "@/lib/projects/data";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

/**
 * GET /api/v1/public/packages
 * Bounded aggregate over the verified registry mapping (no per-node fan-out
 * from clients). Same provenance semantics as the detail route.
 */
export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const rl = rateLimit(clientKey(ip, "public-packages"), 100, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterMs: rl.resetAfterMs },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetAfterMs / 1000)) } },
    );
  }
  const slugs = Object.keys(NPM_PACKAGE_MAP);
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const project = PROJECTS.find((p) => p.slug === slug);
      const npm = await getProjectExternalMeta(slug, "npm");
      return {
        slug,
        name: project?.name ?? slug,
        package: NPM_PACKAGE_MAP[slug],
        repository: project?.repository ?? null,
        npm,
      };
    }),
  );
  return NextResponse.json(
    { data: items, meta: { count: items.length, retrievedAt: new Date().toISOString() } },
    { headers: { "Cache-Control": PUBLIC_API_CACHE_CONTROL } },
  );
}
