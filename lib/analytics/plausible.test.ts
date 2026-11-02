import { describe, expect, it } from "vitest";
import { analyticsConfig } from "@/lib/analytics/plausible";

describe("analyticsConfig", () => {
  it("is disabled without a domain (safe default)", () => {
    expect(analyticsConfig().enabled).toBe(false);
  });
});
