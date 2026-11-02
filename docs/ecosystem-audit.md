# Documentation & Ecosystem Audit (Prompt 4, Phase 1)

Date: 2026-10-09/12 · Method: read repo code; fetched all 12 `package.json` manifests + README section headers from `raw.githubusercontent.com` (main branch, all 200); probed npm registry for 8 candidate names.

## 1.1 Documentation architecture (observed)

- Framework: Next.js 16 App Router, `app/[locale]/docs` + `app/[locale]/docs/[slug]`, 4 hand-authored articles as static TS data, sidebar nav, reading width capped, code blocks LTR, EN canonical with AR UI strings. No MDX engine, no generator, no search. Decision: **keep hand-authored static articles** (corpus is small; no second content system).
- Reusable for Phase 2: design system (`Card`, `Badge`), locale routing, `ExternalMeta` provenance card, detail API, `NPM_PACKAGE_MAP`, `editorialRepoMap()`.

## 1.2 Ecosystem inventory (source evidence)

Types from manifests: **libraries** (units, nutrition-units, whichenv, repo-fetch, cli-sound, marketplace-fetch-pack), **apps** (feed-formulation, vetwo-market-place registry service), **monorepos** (units-manager, cli), **scaffolder** (create-vetwo-pack, bin-only), **docs tool** (docs, unpublished).

### Verified direct dependency edges (manifest `dependencies`, runtime)

| From (slug) | To (package) | Range | Source |
|---|---|---|---|
| nutrition-units | `@vetwo/units` | ^0.0.1 | `nutrition-units/package.json` + README domain-layer statement |
| marketplace-fetch-pack | `@vetwo/repo-fetch` | ^1.0.0 | `marketplace-fetch-pack/package.json` |
| create-vetwo-pack | `@vetwo/whichenv` | ^1.0.0 | `Create-VeTwo-Pack/package.json` |

All other pairs: **no manifest dependency observed** (checked `dependencies` of all 12). Feed-Formulation has no VeTwo deps (standalone Next.js scaffold). Conceptual layering (engine→domain→app) is documented in org/README only — shown as conceptual, not dependency edges.

### Registry verification (probed 2026-10-09/12)

Published (200): `@vetwo/units`, `@vetwo/nutrition-units`, `@vetwo/whichenv`, `@vetwo/repo-fetch`, `create-vetwo-pack`. Unpublished (404): `@vetwo/cli-sound`, `@vetwo/docs`, `@vetwo/marketplace`, `units-monorepo`, `Cli`, `vetwo-marketplace`, `feed-formulation`.
**Correction applied this prompt:** unscoped `cli-sound@1.1.3` ("Play a sound from your CLI app", no repository field) is NOT verifiably VeTwo's (repo manifest names `@vetwo/cli-sound`, unpublished) → mapping **removed** from `NPM_PACKAGE_MAP` (now 5 entries). `marketplace-fetch-pack` README documents `npm install @vetwo/marketplace`, but that package 404s → documented-but-unpublished, flagged for maintainer confirmation; no install card shown.

### Verified install commands (verbatim from READMEs)

- `npm install @vetwo/units` / `bun add @vetwo/units` (units README)
- `npm install @vetwo/units @vetwo/nutrition-units` (nutrition-units README)
- `npm install @vetwo/repo-fetch` (+pnpm/yarn variants) (repo-fetch README)
- `npx whichenv …` + `import { detectProject } from "@vetwo/whichenv"` (whichenv README)
- Repo READMEs use `github.com/vetwo/…` badge URLs (lowercase) vs real `VeTwo-dev` org — recorded inconsistency; site links use verified `VeTwo-dev` URLs only.

## 1.3 Coverage per project (V=verified, P=partial, M=missing, C=needs maintainer confirmation)

| slug | overview | install | quickstart | arch | api ref | config | test | build | trouble | changelog | links | ar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| units | V | V | V | V | V | M | M | M | M | M | V | summary |
| nutrition-units | V | V | V | V | V | M | M | M | M | M | V | summary |
| feed-formulation | C (boilerplate README) | P (generic dev) | P | M | M | M | M | M | M | M | V(repo) | summary |
| whichenv | V | V(npx) | V | P | P | M | M | M | M | M | V | summary |
| repo-fetch | V | V | V | P | P | M | M | M | M | M | V | summary |
| cli-sound | V | C(unpublished) | V | P | V | V | M | M | M | M | V(repo) | summary |
| create-vetwo-pack | C(stub README) | C(bin, unpublished cmd) | M | M | M | M | M | P(scripts) | M | M | V | summary |
| vetwo-market-place | V | P(workspace) | V | V | P | M | M | V(scripts) | M | M | V(repo) | summary |
| docs | V | V(README) | V | P | P | P | M | V(scripts) | M | M | V(repo) | summary |
| units-manager | V | P(workspace) | P | V(structure) | M | M | M | V(scripts) | M | M | V(repo) | summary |
| cli | V | P(workspace) | V | V(structure) | M | M | P(security audit) | V(scripts) | M | M | V(repo) | summary |
| marketplace-fetch-pack | V | C(unpublished pkg) | V | P | P | M | M | M | M | M | V(repo) | summary |

No changelogs, troubleshooting, or test docs observed in any README — site shows none (no fabrication).

## 1.4 Brand assets

Unchanged from `docs/logo-inventory.md`: no official SVG/favicon/OG assets in repo; interim abstract mark in use; OG metadata references `/icon.svg` (interim). Gap + specs documented; no substitute presented as official.

## 1.5 Implementation plan (recommendations → applied)

1. Extend docs IA only with evidence-backed articles (quickstarts for 5 published packages, API refs for `units`/`nutrition-units` from README-verified exports, architecture from manifests+READMEs). No empty categories.
2. Static TS content pipeline kept (safe by construction: React-escaped text, no MDX engine, no upstream HTML).
3. Ecosystem explorer: hand-rolled accessible SVG (no new deps — React Flow/D3 unjustified for 12 nodes), verified edges only + conceptual layering labeled as such, full list alternative, legend not color-only.
4. `GET /api/v1/public/packages` aggregate over existing service (bounded, 5 mapped slugs) — avoids N serial upstream calls; same provenance semantics.
5. Local search index (docs + projects, EN+AR) + Cmd/Ctrl+K palette, no query text to analytics.
6. Detail pages: resource nav with existing links only.
7. Tests: registry map, edges, search index, packages API, palette behavior (JSDOM-free pure parts), explorer data builder.
