import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CACHE_TTL_MS,
  CACHE_TTL_SECONDS,
  CACHE_VERSION,
  ERROR_TTL_MS,
  MAX_CACHE_ENTRIES,
  NO_STORE_CACHE_CONTROL,
  PUBLIC_API_CACHE_CONTROL,
  createTtlCache,
} from "./cache-policy";
import { ERROR_TTL_MS as SERVICE_ERROR_TTL, META_TTL_MS } from "../external/service";

describe("canonical cache policy", () => {
  it("defines a three-hour lifetime in one authoritative location", () => {
    expect(CACHE_TTL_SECONDS).toBe(10_800);
    expect(CACHE_TTL_MS).toBe(10_800 * 1000);
    expect(PUBLIC_API_CACHE_CONTROL).toContain(`max-age=${CACHE_TTL_SECONDS}`);
  });

  it("routes eligible paths through the canonical duration", () => {
    // External metadata reuses the policy instead of a magic number.
    expect(META_TTL_MS).toBe(CACHE_TTL_MS);
    expect(SERVICE_ERROR_TTL).toBe(ERROR_TTL_MS);
    expect(ERROR_TTL_MS).toBeLessThan(CACHE_TTL_MS);
  });

  it("keeps dynamic probes uncached", () => {
    expect(NO_STORE_CACHE_CONTROL).toBe("no-store");
  });
});

describe("createTtlCache", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reuses entries within the lifetime (no real sleeps)", () => {
    let now = 1_000_000;
    const cache = createTtlCache<string, number>(CACHE_TTL_MS, { nowMs: () => now });
    cache.set("a", 1);
    expect(cache.get("a")).toBe(1);
    now += CACHE_TTL_MS - 1;
    expect(cache.get("a")).toBe(1);
  });

  it("expires entries past the lifetime so they refresh", () => {
    let now = 1_000_000;
    const cache = createTtlCache<string, number>(1000, { nowMs: () => now });
    cache.set("a", 1);
    now += 1001;
    expect(cache.get("a")).toBeUndefined();
    expect(cache.size()).toBe(0);
  });

  it("isolates keys so different queries never collide", () => {
    const cache = createTtlCache<string, number>(CACHE_TTL_MS);
    cache.set("q=units", 1);
    cache.set("q=feed", 2);
    expect(cache.get("q=units")).toBe(1);
    expect(cache.get("q=feed")).toBe(2);
    expect(cache.get("q=other")).toBeUndefined();
  });

  it("bounds retention under flood", () => {
    const cache = createTtlCache<string, number>(CACHE_TTL_MS, { maxEntries: 5 });
    for (let i = 0; i < 50; i++) cache.set(`k${i}`, i);
    expect(cache.size()).toBeLessThanOrEqual(5);
    expect(cache.size()).toBeLessThanOrEqual(MAX_CACHE_ENTRIES);
  });

  it("supports targeted invalidation for post-mutation use", () => {
    const cache = createTtlCache<string, number>(CACHE_TTL_MS);
    cache.set("projects:units", 1);
    cache.set("projects:feed", 2);
    cache.set("other", 3);
    expect(cache.invalidatePrefix("projects:")).toBe(2);
    expect(cache.get("projects:units")).toBeUndefined();
    expect(cache.get("other")).toBe(3);
    expect(cache.invalidate("other")).toBe(true);
    expect(cache.invalidate("other")).toBe(false);
  });

  it("exposes the namespace version for schema-change invalidation", () => {
    expect(CACHE_VERSION).toBeGreaterThanOrEqual(1);
  });
});
