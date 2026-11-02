import { freshnessOf, type Provenance } from "../data/provenance";
import { getExternalMeta, saveExternalMeta } from "../catalog";
import { editorialRepoMap } from "../projects/identity";
import { fetchGitHubRepoMeta, type GitHubRepoMeta } from "./github";
import { NPM_PACKAGE_MAP, fetchNpmPackageMeta, type NpmPackageMeta } from "./npm";
import { CACHE_TTL_MS, ERROR_TTL_MS as POLICY_ERROR_TTL_MS } from "../data/cache-policy";

/**
 * Refresh intervals from the canonical cache policy: 3h for good data,
 * 5min negative cache for failures. The persisted collection stays active in
 * all environments (it protects upstream rate limits); the in-memory catalog
 * cache alone is bypassed in development.
 */
export const META_TTL_MS = CACHE_TTL_MS;
export const ERROR_TTL_MS = POLICY_ERROR_TTL_MS;

export type ExternalMetaView =
  | {
      available: true;
      provider: "github" | "npm";
      data: Record<string, unknown>;
      provenance: Provenance;
    }
  | {
      available: false;
      provider: "github" | "npm";
      reason: "unmapped" | "unavailable" | "not_public";
      provenance: Provenance;
    };

function view(
  slug: string,
  provider: "github" | "npm",
  source: string,
  record: { status: "ok" | "error"; data: Record<string, unknown>; fetchedAt: string; sourceUpdatedAt: string | null } | null,
  nowMs: number,
): ExternalMetaView {
  const base: Provenance = {
    kind: "cached",
    source,
    retrievedAt: record?.fetchedAt ?? new Date(nowMs).toISOString(),
    sourceUpdatedAt: record?.sourceUpdatedAt ?? null,
    freshness: record ? freshnessOf(record.fetchedAt, META_TTL_MS, nowMs) : "unknown",
  };
  if (!record || record.status !== "ok") {
    return { available: false, provider, reason: "unavailable", provenance: base };
  }
  return { available: true, provider, data: record.data, provenance: base };
}

/**
 * Refresh-if-stale orchestration for one (slug, provider).
 * - Slug must be an editorial slug (allow-list); unknown slugs are "unmapped".
 * - Serves last-known-good on refresh failure; failures are cached briefly.
 * - No Redis/queue/cron: per-request refresh, one upstream call max per stale read.
 */
export async function getProjectExternalMeta(
  slug: string,
  provider: "github" | "npm",
  nowMs = Date.now(),
): Promise<ExternalMetaView> {
  if (provider === "github") {
    const repo = editorialRepoMap().get(slug);
    if (!repo) {
      return {
        available: false,
        provider,
        reason: "unmapped",
        provenance: { kind: "cached", source: "api.github.com", retrievedAt: new Date(nowMs).toISOString(), sourceUpdatedAt: null, freshness: "unknown" },
      };
    }
    const cached = await getExternalMeta(slug, "github");
    const freshOk = cached && cached.status === "ok" && !isExpired(cached.fetchedAt, META_TTL_MS, nowMs);
    const freshErr = cached && cached.status === "error" && !isExpired(cached.fetchedAt, ERROR_TTL_MS, nowMs);
    if (freshOk || freshErr) {
      return view(slug, provider, "api.github.com", cached, nowMs);
    }
    const res = await fetchGitHubRepoMeta(repo);
    if (!res.ok) {
      const reason = res.failure.kind === "not_public" ? "not_public" : "unavailable";
      await saveExternalMeta({ slug, provider, status: "error", data: {}, fetchedAt: new Date(nowMs).toISOString(), sourceUpdatedAt: null });
      if (cached && cached.status === "ok") return view(slug, provider, "api.github.com", cached, nowMs);
      return {
        available: false,
        provider,
        reason,
        provenance: { kind: "cached", source: "api.github.com", retrievedAt: new Date(nowMs).toISOString(), sourceUpdatedAt: null, freshness: "unknown" },
      };
    }
    const meta: GitHubRepoMeta = res.meta;
    const fetchedAt = new Date(nowMs).toISOString();
    await saveExternalMeta({
      slug,
      provider,
      status: "ok",
      data: { ...meta },
      fetchedAt,
      sourceUpdatedAt: meta.pushedAt,
    });
    return view(slug, provider, "api.github.com", { status: "ok", data: { ...meta }, fetchedAt, sourceUpdatedAt: meta.pushedAt }, nowMs);
  }

  const pkg = NPM_PACKAGE_MAP[slug];
  if (!pkg) {
    return {
      available: false,
      provider,
      reason: "unmapped",
      provenance: { kind: "cached", source: "registry.npmjs.org", retrievedAt: new Date(nowMs).toISOString(), sourceUpdatedAt: null, freshness: "unknown" },
    };
  }
  const cached = await getExternalMeta(slug, "npm");
  const freshOk = cached && cached.status === "ok" && !isExpired(cached.fetchedAt, META_TTL_MS, nowMs);
  const freshErr = cached && cached.status === "error" && !isExpired(cached.fetchedAt, ERROR_TTL_MS, nowMs);
  if (freshOk || freshErr) {
    return view(slug, provider, "registry.npmjs.org", cached, nowMs);
  }
  const res = await fetchNpmPackageMeta(pkg);
  if (!res.ok) {
    await saveExternalMeta({ slug, provider, status: "error", data: {}, fetchedAt: new Date(nowMs).toISOString(), sourceUpdatedAt: null });
    if (cached && cached.status === "ok") return view(slug, provider, "registry.npmjs.org", cached, nowMs);
    return {
      available: false,
      provider,
      reason: "unavailable",
      provenance: { kind: "cached", source: "registry.npmjs.org", retrievedAt: new Date(nowMs).toISOString(), sourceUpdatedAt: null, freshness: "unknown" },
    };
  }
  const meta: NpmPackageMeta = res.meta;
  const fetchedAt = new Date(nowMs).toISOString();
  await saveExternalMeta({
    slug,
    provider,
    status: "ok",
    data: { ...meta },
    fetchedAt,
    sourceUpdatedAt: meta.publishedAt,
  });
  return view(slug, provider, "registry.npmjs.org", { status: "ok", data: { ...meta }, fetchedAt, sourceUpdatedAt: meta.publishedAt }, nowMs);
}

function isExpired(fetchedAtIso: string, ttlMs: number, nowMs: number): boolean {
  const t = Date.parse(fetchedAtIso);
  if (Number.isNaN(t)) return true;
  return nowMs - t > ttlMs;
}
