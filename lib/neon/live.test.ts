/**
 * Live Neon integration tests. GATED: skipped unless VETWO_TEST_NEON=1 with
 * real Neon env vars present (DATABASE_URL + AWS_*). Uses a unique probe
 * object that is always deleted afterwards — never touches user data.
 */
import { describe, expect, it } from "vitest";
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { BUCKET } from "./storage";
import { getSql, postgresStatus } from "./postgres";
import { getS3, storageStatus } from "./storage";

const ENABLED = process.env.VETWO_TEST_NEON === "1" && Boolean(process.env.DATABASE_URL);
const run = ENABLED ? describe : describe.skip;

run("live neon services", () => {
  it("postgres answers SELECT 1", async () => {
    const status = await postgresStatus();
    expect(status).toMatchObject({ configured: true, connected: true });
    const sql = getSql();
    expect(sql).not.toBeNull();
  });

  it("object storage round-trips a probe object (put/get/delete)", async () => {
    const s3 = getS3();
    expect(s3).not.toBeNull();
    if (!s3) return;
    const key = `vetwo-probe-${Date.now()}-${Math.floor(Math.random() * 1e6)}.txt`;
    const body = "vetwo connectivity probe — safe to delete";
    try {
      await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: "text/plain" }));
      const got = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
      const text = await got.Body?.transformToString();
      expect(text).toBe(body);
      const status = await storageStatus();
      expect(status).toMatchObject({ configured: true, connected: true });
    } finally {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    }
  });
});
