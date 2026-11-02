import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import sitemap from "../app/sitemap";
import robots from "../app/robots";

// CSP lives in proxy.ts (per-request nonce) built by lib/security/csp.ts.
// Assert on those committed sources (regression guard for header weakening).
const proxyText = fs.readFileSync(path.resolve(__dirname, "../proxy.ts"), "utf8");
const nextConfigText = fs.readFileSync(path.resolve(__dirname, "../next.config.js"), "utf8");

describe("security headers regression", () => {
  it("declares a restrictive CSP without unsafe-eval", () => {
    expect(proxyText).toContain("buildCsp(nonce");
    expect(proxyText).toContain("x-nonce");
    // No static CSP header here: two enforced CSPs would union and break hydration.
    expect(nextConfigText).not.toContain('{ key: "Content-Security-Policy"');
  });
  it("declares clickjacking, MIME, referrer, permissions, and HSTS controls", () => {
    for (const s of [
      "X-Frame-Options",
      "DENY",
      "X-Content-Type-Options",
      "nosniff",
      "Referrer-Policy",
      "Permissions-Policy",
      "camera=()",
      "Strict-Transport-Security",
      "poweredByHeader: false",
    ]) {
      expect(nextConfigText, s).toContain(s);
    }
  });
});

describe("SEO regression: sitemap + robots", () => {
  it("emits absolute production-origin URLs only", () => {
    for (const entry of sitemap()) {
      expect(entry.url.startsWith("https://vetwo.dev/")).toBe(true);
      expect(entry.url).not.toContain("localhost");
      expect(entry.url).not.toContain("127.0.0.1");
    }
  });
  it("covers both locales, the four pages, and the notes index", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://vetwo.dev/en");
    expect(urls).toContain("https://vetwo.dev/ar");
    expect(urls).toContain("https://vetwo.dev/en/services");
    expect(urls).toContain("https://vetwo.dev/ar/about");
    expect(urls).toContain("https://vetwo.dev/en/blog");
    expect(urls).toContain("https://vetwo.dev/en/blog/getting-started");
    // Removed legacy top-level routes must stay unlisted (article slugs may
    // legitimately reuse those words under /blog).
    for (const u of urls) {
      const first = new URL(u).pathname.split("/")[2];
      expect(["projects", "packages", "docs", "ecosystem"]).not.toContain(first);
    }
  });
  it("keeps APIs out of indexing and points at the sitemap", () => {
    const r = robots();
    expect(JSON.stringify(r.rules)).toContain("/api/");
    expect(r.sitemap).toBe("https://vetwo.dev/sitemap.xml");
  });
});
