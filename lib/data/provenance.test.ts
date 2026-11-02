import { describe, expect, it } from "vitest";
import { freshnessOf, isStale, provenanceLabel, type Provenance } from "./provenance";

const HOUR = 3600_000;

describe("freshnessOf", () => {
  it("marks recent retrievals fresh", () => {
    const now = Date.parse("2026-10-09T12:00:00.000Z");
    expect(freshnessOf("2026-10-09T11:30:00.000Z", HOUR, now)).toBe("fresh");
  });
  it("marks old retrievals stale, never live", () => {
    const now = Date.parse("2026-10-09T12:00:00.000Z");
    expect(freshnessOf("2026-10-08T12:00:00.000Z", HOUR, now)).toBe("stale");
    expect(isStale("2026-10-08T12:00:00.000Z", HOUR, now)).toBe(true);
  });
  it("treats missing/malformed timestamps as unknown, not zero", () => {
    expect(freshnessOf(null, HOUR)).toBe("unknown");
    expect(freshnessOf("not-a-date", HOUR)).toBe("unknown");
  });
});

describe("provenanceLabel", () => {
  const cached: Provenance = {
    kind: "cached",
    source: "api.github.com",
    retrievedAt: "2026-10-09T10:00:00.000Z",
    sourceUpdatedAt: null,
    freshness: "stale",
  };
  it("labels cached data with source + date + freshness", () => {
    expect(provenanceLabel(cached)).toContain("api.github.com");
    expect(provenanceLabel(cached)).toContain("2026-10-09");
    expect(provenanceLabel(cached)).toContain("stale");
  });
  it("labels editorial and simulated distinctly", () => {
    expect(provenanceLabel({ ...cached, kind: "static" })).toContain("Editorial");
    expect(provenanceLabel({ ...cached, kind: "simulated" })).toContain("Simulated");
  });
});
