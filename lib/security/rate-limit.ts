/** Minimal in-memory fixed-window rate limiter for API routes. */
const buckets = new Map<string, { count: number; resetAt: number }>();

/** Upper bound on tracked buckets; oldest-expired entries are pruned on insert. */
export const MAX_BUCKETS = 5000;

function pruneExpired(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, entry] of buckets) {
    if (now >= entry.resetAt) buckets.delete(key);
    if (buckets.size < MAX_BUCKETS) break;
  }
  // If still over budget (all unexpired), drop the oldest entries first.
  for (const key of buckets.keys()) {
    if (buckets.size < MAX_BUCKETS) break;
    buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): {
  allowed: boolean;
  remaining: number;
  resetAfterMs: number;
} {
  const now = Date.now();
  pruneExpired(now);
  const entry = buckets.get(key);
  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAfterMs: windowMs };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAfterMs: entry.resetAt - now };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAfterMs: entry.resetAt - now };
}

/** Test-only introspection (bucket count). */
export function bucketCount(): number {
  return buckets.size;
}

export function clientKey(ip: string | null, route: string): string {
  return `${route}:${ip ?? "unknown"}`;
}
