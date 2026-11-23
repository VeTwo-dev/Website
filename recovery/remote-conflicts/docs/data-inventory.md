# Data Inventory (Prompt 3, Phase 1)

Date: 2026-10-09 · Source: read-only inspection of `lib/`, `app/api/`, `.env.example`, tests, docs.

## What exists

| Item | Location | State |
|---|---|---|
| MongoDB connection (lazy singleton, server-only, 5s timeouts, safe null when unconfigured) | `lib/db/mongodb.ts` | Implemented, graceful-degradation verified by smoke test |
| Editorial catalog, 12 records, unverified fields `null` | `lib/projects/data.ts` + `lib/projects/schema.ts` (Zod) | Implemented; no slugs duplicated (verified by new identity test) |
| Public repository boundary (allow-list projection, `limit ≤ 50`, static fallback) | `lib/db/repository.ts` | Implemented; **no pagination, no stable ordering** (gap) |
| Public list API `GET /api/v1/public/projects` (Zod query, 400/429 shapes) | `app/api/v1/public/projects/route.ts` | Implemented; **no detail route, no cache headers** (gap) |
| Health probe (no creds/stacks) | `app/api/v1/public/health/route.ts` | Implemented |
| Config placeholders | `.env.example` (`MONGODB_URI`, `MONGODB_DB`, Plausible, site URL) | Implemented; no prod secrets in repo |
| Tests (schema, selectors, rate-limit, analytics-off, token mirror) | `lib/**/*.test.ts` | 12/12 pass; **no DB-touching or adapter tests** (gap) |
| GitHub / registry integrations | — | **Missing by design** (correct so far; this prompt adds them) |
| Scheduler / Redis / queues | — | **Intentionally absent**; per-request refresh-if-stale used instead |
| Local `mongod` | `/usr/bin/mongod` present in this environment | Enables genuine local integration verification (test DB only) |

## Data categories observed

- **A. Editorial**: all 12 records in `lib/projects/data.ts` (maintained by hand). Source: org profile.
- **B. Verified repository metadata**: none persisted; displayed nowhere. License/version `null` everywhere.
- **C. Registry metadata**: none. No install commands shown (correct).
- **D. Live telemetry**: none. No gateway/farm claims anywhere (correct).
- **E. Simulated**: one static illustrative units card on detail pages, explicitly labeled (correct).

## Gaps closed by this prompt

1. Canonical identity helpers + duplicate-slug guard (`lib/projects/identity.ts`).
2. Storage schema version + indexes + validator + idempotent setup script (`lib/db/documents.ts`, `scripts/mongo-setup.mjs`).
3. Non-destructive seed script (`scripts/seed-projects.mjs`).
4. Pagination + stable ordering + total in repository and list API (backwards-compatible extension).
5. Persisted `external_meta` cache collection + GitHub/npm adapters (server-only, allow-listed slugs, timeouts, size caps, no tokens in responses) + detail API route + UI provenance card.
6. Fixtures + adapter/cache/API tests (mocked fetch) + local-mongo integration test (gated, test DB only).
