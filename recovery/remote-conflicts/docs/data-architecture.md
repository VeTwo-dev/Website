# Data Architecture & Operations

## Data sources (MongoDB removed 2026-10-15)

| Source | Content | Location |
|---|---|---|
| Editorial catalog | Project records, keyed by canonical `slug` | `lib/projects/data.ts` via `lib/catalog.ts` |
| `external_meta` | Cached upstream snapshots, one per (slug, provider) | Validated process-local store (`lib/neon-meta.ts` schema) |
| Lakebase Postgres (Neon) | Connectivity probe only (`SELECT 1`); no app tables | `lib/neon/postgres.ts` |
| Object storage | Private `assets` bucket; connectivity probe only | `lib/neon/storage.ts` |

## Canonical identity

- Stable ID = `slug` (lowercase, validated by `SLUG_RE`). Display names are never identity.
- `normalizeSlug()` for inputs; `assertUniqueSlugs()` enforced at seed + tests.
- External refs parsed by `parseGitHubRef()`; owner must equal `VeTwo-dev` — mismatches are never silently remapped. Ambiguous renames need explicit maintainer mapping.

## Field provenance

- **A. Editorial** (`lib/projects/data.ts`): slug, names, descriptions (+AR summaries), category, status + reason, tech, repo/docs links, featured. Source: org profile; rendered as static.
- **B. GitHub** (all 12 slugs mapped via editorial URLs): stars, forks, open issues, license (NOASSERTION→null), last push. Unauthenticated REST preferred; optional server-side `GITHUB_TOKEN`.
- **C. Registry** (verified 2026-10-09/12, 5 mapped): `units`→`@vetwo/units`, `nutrition-units`→`@vetwo/nutrition-units`, `whichenv`→`@vetwo/whichenv`, `repo-fetch`→`@vetwo/repo-fetch`, `create-vetwo-pack`→`create-vetwo-pack`. Unscoped `cli-sound` on npm excluded (not verifiably VeTwo's; see `docs/ecosystem-audit.md`). Unmapped slugs stay unmapped; registry links shown, install commands still withheld. Limitation: the abbreviated registry endpoint omits per-version publication timestamps and license, so those render Unknown rather than guessed.
- **D. Live telemetry**: none exists. No authorized source; nothing displayed.
- **E. Simulated**: units-engine illustration on detail pages, labeled.

Every external value carries `{ source, retrievedAt, sourceUpdatedAt, freshness }`; UI shows cached dates and distinguishes genuine zero from unavailable.

## Refresh behavior

Canonical policy (`lib/data/cache-policy.ts`): eligible feature data lives
**10,800s (3h)**.

- Catalog reads are pure computation over static editorial content — no
  database round-trip, no cache needed.
- External metadata uses refresh-if-stale per (slug, provider) against the
  validated process-local store (3h good data, 5min error negative-cache,
  8s upstream timeout, single attempt per stale read, last-known-good on
  failure, old data never labeled live). No Redis/queue/cron.
- No write endpoints exist, so no invalidation traffic;
  `invalidateProjectsCache()` clears the meta store and is reserved for
  future mutations.

## Public API contracts

- `GET /api/v1/public/projects?q&limit&page` → `{ data[], meta: { count, total, page, limit, degraded, retrievedAt } }`. Errors: `{ error: "invalid_query" }` 400, `{ error: "rate_limited", retryAfterMs }` 429. `Cache-Control: public, max-age=10800, stale-while-revalidate=3600`.
- `GET /api/v1/public/projects/[slug]` → `{ data: { project, github, npm }, meta: { retrievedAt } }`. Slug must be a known editorial slug (400 invalid, 404 unknown — no arbitrary upstream fetch). Same error shapes + cache headers.
- `GET /api/v1/public/health` → `{ ok, site, db, analytics }` (no creds/stacks).
- All responses expose allow-listed fields only (no `_id`, tokens, internals).

## Failure behavior

Missing DB config → static editorial catalog (`degraded: false`). DB error → static + `degraded: true`. Upstream outage → last-good cached or honest `unavailable`/`unmapped` states with timestamps. Upstream payloads treated as untrusted: JSON-only, 256KB cap, Zod shapes, fixed hosts, no user-controlled URLs, no HTML rendering.

## Analytics separation (audited)

`trackEvent` sends event names only — no props, no search text, no identifiers; analytics has no MongoDB dependency and stays disabled without env config.

## Local setup & tests

```bash
cp .env.example .env.local            # all service vars optional; site works without them
bun run tokens                       # regenerate design-token CSS after token edits
VETWO_TEST_NEON=1 bun run test lib/neon/live.test.ts   # live Neon probe (needs Neon env vars)
```

Unit suite (mocked fetch) runs with no DB and no network. Integration tests use a disposable DB only.

## Adding a project / disabling an integration

1. Add an editorial record (all unverified fields `null`), keep the slug stable.
2. Run `assertUniqueSlugs` via tests.
3. GitHub mapping is automatic from the repo URL (owner must be `VeTwo-dev`).
4. npm mapping requires a verified published package — add to `NPM_PACKAGE_MAP` only after a 200 probe.
5. To disable: remove the map entry (status becomes `unmapped`, UI shows honest empty state). No code deletion needed.
