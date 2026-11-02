# MongoDB Strategy — REMOVED 2026-10-15

MongoDB was fully removed from this project by explicit user authorization
(see `docs/decisions.md`). The catalog is static editorial content served via
`lib/catalog.ts`; external-metadata snapshots are validated process-local
records (`lib/neon-meta.ts`). Lakebase Postgres (Neon) + object storage are the
provisioned auxiliary services (`neon.ts`).

The removed implementation (connection lifecycle, repository, schemas,
fixtures, seed/setup scripts) is preserved in
`/tmp/vetwo-mongo-backup-20261015.tar.gz`.
