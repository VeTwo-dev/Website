import { describe, expect, it } from "vitest";
import { MAX_BUCKETS, bucketCount, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit then blocks with retry info", () => {
    const key = `test-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60_000).allowed).toBe(true);
    }
    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.resetAfterMs).toBeGreaterThan(0);
  });
  it("caps bucket growth (eviction under flood)", () => {
    for (let i = 0; i < MAX_BUCKETS + 500; i++) {
      rateLimit(`flood-${Date.now()}-${i}`, 100, 60_000);
    }
    expect(bucketCount()).toBeLessThanOrEqual(MAX_BUCKETS);
  });
});
