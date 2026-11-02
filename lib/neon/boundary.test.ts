import { describe, expect, it } from "vitest";
import { getSql, isPostgresConfigured, postgresStatus } from "./postgres";
import { BUCKET, getS3, isStorageConfigured, storageStatus } from "./storage";

describe("neon postgres boundary (unconfigured)", () => {
  it("returns safe nulls without env vars", async () => {
    expect(getSql()).toBeNull();
    expect(isPostgresConfigured()).toBe(false);
    expect(await postgresStatus()).toEqual({ configured: false });
  });
});

describe("object storage boundary (unconfigured)", () => {
  it("returns safe nulls without env vars", async () => {
    expect(getS3()).toBeNull();
    expect(isStorageConfigured()).toBe(false);
    expect(await storageStatus()).toEqual({ configured: false });
  });
  it("targets the private assets bucket", () => {
    expect(BUCKET).toBe("assets");
  });
});
