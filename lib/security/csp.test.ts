import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

describe("buildCsp", () => {
  it("embeds the per-request nonce without unsafe-eval in production", () => {
    const csp = buildCsp("abc123", false);
    expect(csp).toContain("'nonce-abc123'");
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
  });
  it("allows inline style attributes without loosening scripts", () => {
    const csp = buildCsp("n", false);
    const scriptSrc = csp.split("; ").find((p) => p.startsWith("script-src")) ?? "";
    expect(scriptSrc).not.toContain("unsafe-inline");
    expect(scriptSrc).not.toContain("unsafe-eval");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });
  it("serves fonts locally with no remote font origins", () => {
    const csp = buildCsp("n", false);
    expect(csp).not.toContain("fonts.googleapis.com");
    expect(csp).not.toContain("fonts.gstatic.com");
    expect(csp).toContain("font-src 'self'");
  });
  it("allows unsafe-eval in development only (React debugging)", () => {
    expect(buildCsp("n", true)).toContain("'unsafe-eval'");
  });
});
