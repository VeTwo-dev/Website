import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

function getUrl(): string {
  return process.env.DATABASE_URL ?? "";
}

type GlobalPg = typeof globalThis & { __vetwoNeonSql?: NeonQueryFunction<false, false> };

/** Server-only. Returns null when Lakebase Postgres is not configured (dev/test safe). */
export function getSql(): NeonQueryFunction<false, false> | null {
  const url = getUrl();
  if (!url) return null;
  const g = globalThis as GlobalPg;
  if (!g.__vetwoNeonSql) {
    g.__vetwoNeonSql = neon(url);
  }
  return g.__vetwoNeonSql;
}

export type PostgresStatus =
  | { configured: false }
  | { configured: true; connected: boolean; error?: string };

/** Connectivity probe — runs `SELECT 1`, never leaks the connection string. */
export async function postgresStatus(timeoutMs = 8000): Promise<PostgresStatus> {
  const sql = getSql();
  if (!sql) return { configured: false };
  try {
    const rows = (await Promise.race([
      sql`SELECT 1 AS one`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("postgres probe timed out")), timeoutMs),
      ),
    ])) as { one: number }[];
    const ok = Array.isArray(rows) && rows[0]?.one === 1;
    return ok ? { configured: true, connected: true } : { configured: true, connected: false };
  } catch (e) {
    return {
      configured: true,
      connected: false,
      error: e instanceof Error ? e.message : "connection failed",
    };
  }
}

export function isPostgresConfigured(): boolean {
  return Boolean(getUrl());
}
