/**
 * Canonical data-cache policy: eligible feature data lives at most
 * **10,800 seconds (3 hours)**. Single source of truth — no magic numbers
 * elsewhere. See docs/data-architecture.md for scope and exceptions.
 *
 * Scope notes (deliberate, not omissions):
 * - Applies to eligible *feature data* (catalog reads, external metadata).
 *   Route-output, router, request-memoization, browser/CDN, asset, and
 *   driver-pool caches keep their own semantics.
 * - Next 16 runs with `cacheComponents: false` (framework default) and our
 *   Mongo reads bypass `fetch`, so framework data-cache directives do not
 *   apply; the small explicit TTL boundary below implements the policy.
 * - Process-local storage only. No shared cache across instances is claimed.
 * - The catalog itself needs no cache (pure static computation); the TTL
 *   store below serves validated in-memory records with injectable clocks
 *   for deterministic tests.
 */

/** Canonical lifetime: 3 hours, in seconds (public contracts) ... */
export const CACHE_TTL_SECONDS = 10_800;
/** ... and milliseconds (server-side TTL math). */
export const CACHE_TTL_MS = CACHE_TTL_SECONDS * 1000;

/**
 * Negative-cache lifetime for upstream/DB failures: 5 minutes.
 * Justified exception to the 3h default — a failed refresh must retry soon
 * so recovery is fast; failures are never served as successful data.
 */
export const ERROR_TTL_MS = 5 * 60 * 1000;

/** Cache namespace version. Bump to invalidate every entry after a schema change. */
export const CACHE_VERSION = 1;

/** Upper bound on entries per in-memory cache (prevents unbounded growth). */
export const MAX_CACHE_ENTRIES = 200;

/** Browser/CDN directive for public catalog payloads (mirrors the 3h policy). */
export const PUBLIC_API_CACHE_CONTROL = `public, max-age=${CACHE_TTL_SECONDS}, stale-while-revalidate=3600`;

/** Dynamic probes (e.g. health) are never cached by browsers/CDNs. */
export const NO_STORE_CACHE_CONTROL = "no-store";

export type TtlCacheOptions = {
  maxEntries?: number;
  nowMs?: () => number;
};

type Entry<V> = { value: V; expiresAt: number };

/**
 * Minimal bounded TTL store with injectable clock (no real sleeps in tests).
 * Not shared across processes. Use `invalidate()` / `invalidatePrefix()`
 * after mutations; there are currently no write endpoints, so these are
 * exercised by tests and reserved for future admin use.
 */
export function createTtlCache<K, V>(ttlMs: number, options: TtlCacheOptions = {}) {
  const maxEntries = options.maxEntries ?? MAX_CACHE_ENTRIES;
  const now = options.nowMs ?? Date.now;
  const store = new Map<K, Entry<V>>();

  function prune(nowMs: number): void {
    for (const [key, entry] of store) {
      if (entry.expiresAt <= nowMs) store.delete(key);
    }
    while (store.size > maxEntries) {
      const oldest = store.keys().next();
      if (oldest.done) break;
      store.delete(oldest.value);
    }
  }

  return {
    get(key: K): V | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt <= now()) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key: K, value: V): void {
      prune(now());
      store.set(key, { value, expiresAt: now() + ttlMs });
      prune(now());
    },
    invalidate(key: K): boolean {
      return store.delete(key);
    },
    invalidatePrefix(prefix: string): number {
      let removed = 0;
      for (const key of store.keys()) {
        if (String(key).startsWith(prefix)) {
          store.delete(key);
          removed += 1;
        }
      }
      return removed;
    },
    clear(): void {
      store.clear();
    },
    size(): number {
      prune(now());
      return store.size;
    },
  };
}

export type TtlCache<K, V> = ReturnType<typeof createTtlCache<K, V>>;
