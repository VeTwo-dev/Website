import { NextResponse } from "next/server";
import { PublicProjectQuery, listPublicProjectsPaged } from "@/lib/catalog";
import { PUBLIC_API_CACHE_CONTROL } from "@/lib/data/cache-policy";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const rl = rateLimit(clientKey(ip, "public-projects"), 100, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterMs: rl.resetAfterMs },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetAfterMs / 1000)) } },
    );
  }
  const url = new URL(request.url);
  const parsed = PublicProjectQuery.safeParse({
    q: url.searchParams.get("q") ?? "",
    limit: url.searchParams.get("limit") ?? "24",
    page: url.searchParams.get("page") ?? "1",
    category: url.searchParams.get("category") ?? "all",
    status: url.searchParams.get("status") ?? "all",
    sort: url.searchParams.get("sort") ?? "slug",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }
  const page = await listPublicProjectsPaged(parsed.data.q, parsed.data.limit, parsed.data.page, {
    category: parsed.data.category,
    status: parsed.data.status,
    sort: parsed.data.sort,
  });
  return NextResponse.json(
    {
      data: page.items,
      meta: {
        count: page.items.length,
        total: page.total,
        page: page.page,
        limit: page.limit,
        degraded: page.degraded,
        retrievedAt: page.items[0]?.retrievedAt ?? new Date().toISOString(),
      },
    },
    { headers: { "Cache-Control": PUBLIC_API_CACHE_CONTROL } },
  );
}
