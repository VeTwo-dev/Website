import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicProject } from "@/lib/catalog";
import { getProjectExternalMeta } from "@/lib/external/service";
import { PUBLIC_API_CACHE_CONTROL } from "@/lib/data/cache-policy";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { isValidSlug } from "@/lib/projects/identity";

const ParamsSchema = z.object({ slug: z.string().min(1).max(80) });

/**
 * GET /api/v1/public/projects/[slug]
 * Public detail: editorial record + cached external metadata with provenance.
 * Slug must be a known editorial slug — arbitrary upstream fetching is impossible.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const rl = rateLimit(clientKey(ip, "public-project-detail"), 100, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterMs: rl.resetAfterMs },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetAfterMs / 1000)) } },
    );
  }
  const { slug } = await params;
  const parsed = ParamsSchema.safeParse({ slug });
  if (!parsed.success || !isValidSlug(parsed.data.slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  const editorial = getPublicProject(parsed.data.slug);
  if (!editorial) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const [github, npm] = await Promise.all([
    getProjectExternalMeta(editorial.slug, "github"),
    getProjectExternalMeta(editorial.slug, "npm"),
  ]);
  return NextResponse.json(
    { data: { project: editorial, github, npm }, meta: { retrievedAt: new Date().toISOString() } },
    { headers: { "Cache-Control": PUBLIC_API_CACHE_CONTROL } },
  );
}
