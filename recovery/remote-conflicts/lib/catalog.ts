import { z } from "zod";
import { PROJECTS, getProject } from "./projects/data";
import type { ExternalProvider } from "./neon/neon-meta";
import { ExternalMetaDocumentSchema } from "./neon/neon-meta";

/**
 * Public catalog boundary. Single source: the editorial static catalog
 * (`lib/projects/data.ts`). There is no database behind this module —
 * MongoDB was removed from the project; Lakebase Postgres (via Neon) is provisioned as an
 * auxiliary service and the catalog does not depend on it.
 *
 * External-metadata snapshots live in a validated process-local store
 * (see `neon-meta.ts`); the service layer refreshes them on the canonical
 * 3h TTL.
 */

/** Explicit public fields — internal fields are never exposed. */
export const PUBLIC_FIELD_ALLOW_LIST = [
  "slug",
  "name",
  "description",
  "category",
  "status",
  "technologies",
  "repository",
  "source",
  "updatedAt",
] as const;

export const PublicProjectQuery = z.object({
  q: z.string().max(100).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  page: z.coerce.number().int().min(1).max(100).default(1),
  category: z.string().max(40).default("all"),
  status: z.string().max(40).default("all"),
  sort: z.enum(["slug", "name_asc", "name_desc"]).default("slug"),
});

export type CatalogFilters = {
  category?: string;
  status?: string;
  sort?: "slug" | "name_asc" | "name_desc";
};

export type PublicProjectListItem = {
  slug: string;
  name: string;
  description: string;
  category: string;
  status: string;
  technologies: string[];
  repository: string;
  source: string;
  updatedAt: string;
  dataKind: "static";
  retrievedAt: string;
};

export type PublicProjectPage = {
  items: PublicProjectListItem[];
  page: number;
  limit: number;
  total: number;
};

function toListItem(d: Record<string, unknown>, retrievedAt: string): PublicProjectListItem {
  return {
    slug: String(d.slug ?? ""),
    name: String(d.name ?? ""),
    description: String(d.description ?? ""),
    category: String(d.category ?? "Unknown"),
    status: String(d.status ?? "Unknown"),
    technologies: Array.isArray(d.technologies) ? d.technologies.map(String).slice(0, 12) : [],
    repository: String(d.repository ?? ""),
    source: String(d.source ?? "Editorial catalog"),
    updatedAt: String(d.updatedAt ?? retrievedAt),
    dataKind: "static",
    retrievedAt,
  };
}

/**
 * Paged, filtered, stably-ordered catalog read. Pure computation over the
 * editorial catalog; never throws; `degraded` is always false (no upstream
 * to degrade from — external metadata degrades independently per record).
 */
export async function listPublicProjectsPaged(
  q = "",
  limit = 24,
  page = 1,
  filters: CatalogFilters = {},
): Promise<PublicProjectPage & { degraded: boolean }> {
  const retrievedAt = new Date().toISOString();
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.min(Math.max(page, 1), 100);
  const needle = q.trim().toLowerCase();
  const items = PROJECTS.filter((p) =>
    needle ? [p.name, p.description].join(" ").toLowerCase().includes(needle) : true,
  )
    .filter((p) => !filters.category || filters.category === "all" || p.category === filters.category)
    .filter((p) => !filters.status || filters.status === "all" || p.status === filters.status);
  const sorted = items.slice().sort((a, b) =>
    filters.sort === "name_desc"
      ? b.name.localeCompare(a.name)
      : filters.sort === "name_asc"
        ? a.name.localeCompare(b.name)
        : a.slug.localeCompare(b.slug),
  );
  const start = (safePage - 1) * safeLimit;
  return {
    items: sorted.slice(start, start + safeLimit).map((p) => toListItem({ ...p }, retrievedAt)),
    page: safePage,
    limit: safeLimit,
    total: sorted.length,
    degraded: false,
  };
}

/** Backwards-compatible list shape used by existing callers. */
export async function listPublicProjects(q = "", limit = 24): Promise<PublicProjectListItem[]> {
  const page = await listPublicProjectsPaged(q, limit, 1);
  return page.items;
}

/** Editorial detail lookup by canonical slug (static, always available). */
export function getPublicProject(slug: string): PublicProjectListItem | null {
  const p = getProject(slug);
  if (!p) return null;
  return toListItem({ ...p }, new Date().toISOString());
}

export type ExternalMetaRecord = {
  slug: string;
  provider: ExternalProvider;
  status: "ok" | "error";
  data: Record<string, unknown>;
  fetchedAt: string;
  sourceUpdatedAt: string | null;
};

const metaStore = new Map<string, ExternalMetaRecord>();

function metaKey(slug: string, provider: ExternalProvider): string {
  return `${slug}:${provider}`;
}

/** Read a cached external-meta snapshot. Null when absent or invalid. */
export async function getExternalMeta(slug: string, provider: ExternalProvider): Promise<ExternalMetaRecord | null> {
  const record = metaStore.get(metaKey(slug, provider)) ?? null;
  if (!record) return null;
  const parsed = ExternalMetaDocumentSchema.safeParse({ ...record, schemaVersion: 1 });
  if (!parsed.success) {
    metaStore.delete(metaKey(slug, provider));
    return null;
  }
  return record;
}

/** Persist an external-meta snapshot. Validates before writing. */
export async function saveExternalMeta(record: ExternalMetaRecord): Promise<boolean> {
  const parsed = ExternalMetaDocumentSchema.safeParse({ ...record, schemaVersion: 1 });
  if (!parsed.success) return false;
  metaStore.set(metaKey(record.slug, record.provider), {
    slug: parsed.data.slug,
    provider: parsed.data.provider,
    status: parsed.data.status,
    data: parsed.data.data as Record<string, unknown>,
    fetchedAt: parsed.data.fetchedAt,
    sourceUpdatedAt: parsed.data.sourceUpdatedAt,
  });
  return true;
}

/** Clears cached catalog + external-meta state (post-mutation hook; no write endpoints exist yet). */
export function invalidateProjectsCache(): void {
  metaStore.clear();
}
