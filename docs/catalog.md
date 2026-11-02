# Catalog & Detail Experience Plan (Prompt 3, Phase 1)

Date: 2026-10-12 · Audited: catalog page, detail page, `lib/db/repository.ts`, both public API routes, schema/data/identity, explorer edges, tests.

## Current architecture (observed)

- Catalog page renders from in-memory `searchProjects()` (complete 12-item dataset) with GET-form search, link-based category/status/view filters, no sort, no pagination UI, inline card markup. Correct but bypasses the DB boundary; `limit` applied post-filter.
- List API (`q&limit&page`, Zod-bounded, rate-limited, cached headers) lacks category/status/sort; detail API (slug allow-list + provenance) verified. No contract drift in shapes, but page and API filter differently.
- Detail page: back link (no breadcrumb), status card, install card (registry-gated), Resources, `ExternalMeta` (client, offline-safe build). No highlights, no related projects, no copy buttons, no skeletons on route level.
- Dead filter: `IoT` category pill matches zero projects. Statuses all populated except Stable/Maintenance/Deprecated (kept — valid enum values with honest empty states).

## Contracts confirmed (reuse)

`GET /api/v1/public/projects` envelope `{data[], meta:{count,total,page,limit,degraded,retrievedAt}}`; detail `{data:{project,github,npm},meta}`; 400/404/429 shapes; allow-listed fields; refresh-if-stale provenance. Additive extension only: `category`, `status`, `sort` query params.

## Changes (reversible, additive)

1. **Repository/API**: `PublicProjectQuery` += `category` (enum+all), `status` (enum+all), `sort` (`name_asc|name_desc`, default slug order). Mongo filter + static filter + both sorts. Page consumes `listPublicProjectsPaged` (single boundary; limit 24).
2. **Catalog UI**: reusable `ProjectCard`; sort select (URL param, resets page); pagination prev/next + numbered window (URL params); categories derived from data (drop empty IoT); result count from `meta.total`; route `loading.tsx` skeleton; filters reset page on change (links rebuild query).
3. **Detail**: breadcrumb `<ol>` (RTL-flipping chevrons), action area, `highlights` editorial field (README-sourced, 8 documented projects; empty → section omitted), metadata panels, related projects from `VERIFIED_EDGES` (both directions, labeled dependency vs conceptual), `CopyButton` for install snippets, resources/ExternalMeta preserved.
4. **Schema**: `ProjectSchema` += `highlights: string[max 4].max(120)` default []; JSON validator untouched (allows extra fields); fixtures unaffected.

## Verified vs unavailable

Verified per project: overview, install (5 published), quickstarts (READMEs), stack, repo/registry links, GitHub/npm live meta. Unavailable everywhere: changelog, tests, troubleshooting, versions/licenses except via live meta. Cards show static + links only (no per-card upstream fetch — preserved).

## Risks → mitigations

- Partial-page filtering: eliminated by unifying page+API on the paged boundary with server-side filters.
- Stale overwrites: N/A (SSR, no client fetching for catalog).
- Nested links: title link + labeled icon links, never nested.
- RTL: logical props, flipping chevrons, LTR code/identifiers.
- Perf: 12-item SSR, no new deps, stagger/lift reuse.

## Tests

Sort comparator + order, page-window builder, catalog href builder (reset semantics), highlights schema default/empty, contract tests extended (sort/category params), route tests for new params + invalid sort, document the IoT-filter removal.

## Phase 2 outcomes (2026-10-12)

Implemented: unified page+API boundary (`category`/`status`/`sort` additive params, validated); `ProjectCard` (single primary link + labeled icon links, editorial-only); sort select + pagination (numbered window, prev/next) in URL state with page reset; categories derived from data (empty IoT pill removed); `highlights` on 10 README-sourced projects (2 stubs omitted); detail page with breadcrumb, action area, capabilities, `CopyButton`, related projects (dependency vs conceptual labels); route `loading.tsx` skeleton; `INSTALL_COMMANDS` map (4 verified entries).
Verification: lint/typecheck pass, 101/101 tests, build pass; live: filtered/sorted catalog, 400 on bad sort, paged API totals, detail sections + AR translations + flipping chevrons, copy buttons, related links. No-browser viewport checks and per-card upstream fetching (deliberately absent) recorded as before.
