import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const BUCKET = "assets";

function getConfig(): { endpoint: string; region: string; accessKeyId: string; secretAccessKey: string } | null {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3 ?? "";
  const region = process.env.AWS_REGION ?? "";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? "";
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? "";
  if (!endpoint || !region || !accessKeyId || !secretAccessKey) return null;
  return { endpoint, region, accessKeyId, secretAccessKey };
}

type GlobalS3 = typeof globalThis & { __vetwoS3?: S3Client };

/** Server-only. Returns null when object-storage credentials are absent. */
export function getS3(): S3Client | null {
  const cfg = getConfig();
  if (!cfg) return null;
  const g = globalThis as GlobalS3;
  if (!g.__vetwoS3) {
    g.__vetwoS3 = new S3Client({
      endpoint: cfg.endpoint,
      region: cfg.region,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
      forcePathStyle: true,
    });
  }
  return g.__vetwoS3;
}

export type StorageStatus =
  | { configured: false }
  | { configured: true; connected: boolean; error?: string };

/** Connectivity probe — lists zero objects (read-only, no writes). */
export async function storageStatus(timeoutMs = 8000): Promise<StorageStatus> {
  const s3 = getS3();
  if (!s3) return { configured: false };
  try {
    const { HeadBucketCommand } = await import("@aws-sdk/client-s3");
    await Promise.race([
      s3.send(new HeadBucketCommand({ Bucket: BUCKET })),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("storage probe timed out")), timeoutMs),
      ),
    ]);
    return { configured: true, connected: true };
  } catch (e) {
    return {
      configured: true,
      connected: false,
      error: e instanceof Error ? e.message : "connection failed",
    };
  }
}

export function isStorageConfigured(): boolean {
  return getConfig() !== null;
}

export { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, BUCKET };
