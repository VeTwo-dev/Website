import { describe, expect, it } from "vitest";
import { GET as listGET } from "./route";
import { GET as healthGET } from "../health/route";
import { CACHE_TTL_SECONDS, NO_STORE_CACHE_CONTROL } from "@/lib/data/cache-policy";

describe("GET /api/v1/public/projects validation", () => {
  it("rejects excessive pagination and oversized queries", async () => {
    for (const qs of ["limit=999", "page=101", `q=${"x".repeat(101)}`, "limit=0"]) {
      const res = await listGET(new Request(`https://vetwo.dev/api/v1/public/projects?${qs}`));
      expect(res.status, qs).toBe(400);
      expect(await res.json()).toEqual({ error: "invalid_query" });
    }
  });
  it("sets public cache headers on success", async () => {
    const res = await listGET(new Request("https://vetwo.dev/api/v1/public/projects?limit=2"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain(`max-age=${CACHE_TTL_SECONDS}`);
  });
});

describe("GET /api/v1/public/health", () => {
  it("returns a safe shape without internals", async () => {
    for (const k of ["DATABASE_URL", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_ENDPOINT_URL_S3"]) {
      delete process.env[k];
    }
    const res = await healthGET(new Request("https://vetwo.dev/api/v1/public/health"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    const flat = JSON.stringify(body);
    expect(flat).not.toContain("MONGODB_URI");
    expect(flat).not.toContain("mongodb://");
    expect(flat).not.toContain("DATABASE_URL");
    expect(flat).not.toContain("AWS_SECRET");
    expect(flat).not.toContain("stack");
    expect(res.headers.get("Cache-Control")).toBe(NO_STORE_CACHE_CONTROL);
    expect(body.postgres.connected).toBe(false);
    expect(body.objectStorage.connected).toBe(false);
  });
});
