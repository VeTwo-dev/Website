import { NextResponse } from "next/server";
import { postgresStatus } from "@/lib/neon/postgres";
import { storageStatus } from "@/lib/neon/storage";
import { NO_STORE_CACHE_CONTROL } from "@/lib/data/cache-policy";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

/** Public health probe — never leaks credentials, connection strings, or stack traces. */
export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const rl = rateLimit(clientKey(ip, "public-health"), 100, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterMs: rl.resetAfterMs },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetAfterMs / 1000)) } },
    );
  }
  const [postgres, storage] = await Promise.all([postgresStatus(), storageStatus()]);
  const pick = (s: { configured: boolean; connected?: boolean }) =>
    s.configured ? { connected: s.connected ?? false } : { connected: false, note: "not configured" };
  return NextResponse.json(
    {
      ok: true,
      site: "vetwo.dev",
      postgres: pick(postgres),
      objectStorage: pick(storage),
      analytics: { provider: "plausible-compatible", enabled: Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) },
    },
    // Dynamic probe: never cached by browsers/CDNs.
    { headers: { "Cache-Control": NO_STORE_CACHE_CONTROL } },
  );
}
