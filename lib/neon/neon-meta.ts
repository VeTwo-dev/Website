import { z } from "zod";

/** Canonical schema version for persisted-shaped records. */
export const SCHEMA_VERSION = 1;

export const ExternalProvider = z.enum(["github", "npm"]);
export type ExternalProvider = z.infer<typeof ExternalProvider>;

/**
 * Validated shape for external-metadata cache records (process-local store
 * in `lib/catalog.ts`). Replaces the former MongoDB document schemas, which
 * were removed with the MongoDB integration (backup:
 * /tmp/vetwo-mongo-backup-20261015.tar.gz).
 */
export const ExternalMetaDocumentSchema = z.object({
  slug: z.string().min(1).max(80),
  provider: ExternalProvider,
  status: z.enum(["ok", "error"]),
  data: z.record(z.string(), z.unknown()).default({}),
  fetchedAt: z.string().datetime(),
  sourceUpdatedAt: z.string().nullable().default(null),
  schemaVersion: z.number().int().min(1).default(SCHEMA_VERSION),
});

export type ExternalMetaDocument = z.infer<typeof ExternalMetaDocumentSchema>;
