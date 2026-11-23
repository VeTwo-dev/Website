# Implementation Inventory & Gap Report (Prompt 2, Phase 1)

Date: 2026-10-09 · Method: read code/config/docs, ran `lint` + `typecheck` + `test` + `build` before and after changes.

## Baseline (pre-change, all passing)

- `next lint` (Next 14): clean · `tsc --noEmit`: clean · vitest: 10/10 · `next build`: 33 pages OK.

## Inventory

| Area | Status | Evidence |
|---|---|---|
| Design tokens, single source of truth | Partially implemented | `tokens/design-tokens.json` existed; `generate-tokens.mjs` produced `app/tokens.css`; but `tailwind.config.js` duplicated hexes via `require` with no enforcement |
| Foundational components | Implemented, not adequately verified | `components/ui.tsx` existed; new flat-config lint is stricter (caught dead code) |
| Official logo integration | Blocked (external) | No official asset in repo (see `docs/logo-inventory.md`); interim abstract mark used, never claimed official |
| Homepage + public routes | Implemented and verified | `/[locale]`, `/projects`, `/projects/[slug]` ×12, `/docs`, `/ecosystem`, `/about`; build prerenders all |
| EN/AR localization + RTL | Implemented, needs polish check | `lang`/`dir`, dictionaries, logical properties; AR technical strings fall back to EN summaries (by design) |
| MongoDB boundary | Implemented and verified | Server-only, Zod-validated, allow-list projection, bounded, static fallback; no creds in client |
| External API integrations | Missing (by design) | No live GitHub/registry calls; editorial static data only — correct per brief, not a regression |
| Analytics | Partially implemented | Optional Plausible boundary existed but `trackEvent` was never called; no click instrumentation |
| SEO/sitemap/structured data | Partially implemented | Sitemap + robots + manifest + title template existed; missing: OpenGraph, `hreflang`, JSON-LD, icon metadata; manifest referenced non-existent `apple-touch-icon.png` |
| Accessibility/responsive | Implemented, not adequately verified | Skip link, focus-visible, 44px targets, reduced-motion, semantic HTML; no browser verification possible in this env |
| Security headers/CSP/validation | Implemented and verified | Headers in `next.config.js`; Zod on APIs; rate limits with `Retry-After`; safe error UI |
| CI/tests/deploy config | Partially implemented | CI ran npm on Node 20; lockfile was `package-lock.json`; no deploys (correct — unapproved) |
| Dependencies | Stale (fixed this prompt) | Next 14 deps had a published vuln warning; `lucide-react` installed but unused; `autoprefixer` redundant under Tailwind v4 |
| Package manager | Migrated | npm → Bun 1.4 (`packageManager: bun@1.4.0`, `engines: { bun >=1.4.0 }`, `bun.lock`); `package-lock.json` removed to avoid competing lockfiles |

## Recommendations applied in this prompt

1. Upgrade to latest majors (Next 16, React 19, Tailwind 4, zod 4, mongodb 7, vitest 5, eslint 10) with code adaptations; keep TypeScript at 6.0.3 (latest line typescript-eslint supports — TS 7 breaks the lint gate, documented in `docs/decisions.md`).
2. Enforce token mirror with `lib/tokens.test.ts`; drop `autoprefixer`; wire `lucide-react` icons into UI.
3. Close SEO gaps (OG, hreflang, JSON-LD, icons), fix manifest, add view toggle, analytics click tracking, offline banner.
4. CI + docs switched to Bun; no admin, no paid infra, no new data claims.
