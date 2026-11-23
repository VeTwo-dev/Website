# Decision Register

## Confirmed (from brief — applied)
- Primary database: MongoDB. No PostgreSQL introduced. Persistence via `lib/db/mongodb.ts` + `lib/db/repository.ts`.
- **Neon exception (explicitly authorized 2026-10-15):** Lakebase Postgres (via Neon) + S3-compatible object storage provisioned as *auxiliary* services (`neon.ts`, branch `production`, private `assets` bucket) alongside MongoDB, which remains primary. Server-only access via `lib/neon/*`; surfaced only as connected/not-configured in health. This supersedes the earlier "no second database" rule by direct user approval.
- **MongoDB removal (explicitly authorized 2026-10-15):** all MongoDB code, tests, scripts, and the `mongodb` dependency were removed (backup: `/tmp/vetwo-mongo-backup-20261015.tar.gz`). The catalog is static editorial content (`lib/projects/data.ts` via `lib/catalog.ts`); external-metadata snapshots are validated process-local records. This supersedes the "MongoDB is primary" decision above by direct user approval. The user-owned `.env` Atlas credentials were left untouched.
- Brand: existing official horse-head logo. NOT found in repo → interim abstract mark + gap doc; no redraw passed off as official.
- Motion: strong effects only in hero + selected reveals; lightweight elsewhere; `prefers-reduced-motion` supported.
- Admin dashboard: out of scope. No admin routes, roles, or CMS built. `/api/v1/admin/*` reserved.
- Analytics: privacy-friendly only (Plausible-compatible, optional, env-driven, no-op when unconfigured).

## Unresolved (need approval / evidence)

1. **MongoDB provider + prod connection**: `.env.example` placeholders only. Need: provider (Atlas vs self-host), connection string handling, backup/restore expectations. Do NOT provision paid infra without approval.
2. **Logo variants**: need official dark/SVG/favicon/apple-touch/web-size sources from brand owner. Current `public/icon.svg` is an interim abstract mark.
3. **Font strategy**: RESOLVED — self-hosted local fonts only (PNU for Arabic, Orbitron for English, `public/fonts`, `@font-face` with `font-display: swap`, no remote providers). PNU license text still unverified — confirm with maintainer.
4. **Analytics provider/host + consent**: Plausible evaluated as compatible; domain/src env-driven. Jurisdiction/consent requirements unverified — no legal-compliance claim.
5. **Contact channels**: `@vetwo_dev` + `security@vetwo.dev` unverified → withheld from site. Need maintainer confirmation + working private reporting path test.
6. **External metadata automation**: GitHub/registry caching, revalidation intervals, ranking weights — deferred; current site uses editorial static data only.
7. **Hosting**: Vercel/Cloudflare/etc documented as options in brief; none selected or provisioned here.

## Prompt 2 addendum (2026-10-09, evidence-based)

- **Package manager**: Bun >= 1.4.0 (`packageManager: bun@1.4.0`, `bun.lock`; `package-lock.json` removed). Bun 1.4.0 verified present in this environment.
- **Latest majors adopted**: Next 16.4.0, React 19.3.0, Tailwind 4.3.3, zod 4.6.5, mongodb 7.7.0, vitest 5.0.3, eslint 10.12.0, lucide-react 1.54.0. Adaptations: async route params, flat ESLint config, Tailwind v4 `@import` + `@config`, PostCSS plugin swap, `next lint` → `eslint .`.
- **TypeScript held at 6.0.3** (latest stable 6.x): TS 7.0.2 breaks `typescript-eslint` (explicit hard error, no workaround), which would disable the lint gate. Re-evaluate when typescript-eslint supports TS 7.
- **`autoprefixer` removed**: redundant under Tailwind v4 (built-in prefix handling). `lucide-react` now wired into header/cards/CTAs (was unused).

## Prompt 4 addendum (2026-10-12, evidence-based)

- **Registry correction**: unscoped `cli-sound` removed from `NPM_PACKAGE_MAP` (not verifiably VeTwo's); map now 5 entries. `marketplace-fetch-pack` README documents an unpublished package — flagged, no install card.
- **No new dependencies**: explorer is hand-rolled SVG, search is a local index, content is static TS (no MDX engine, no React Flow/D3, no search service) — justified by 12-node/12-article scale.
- **Content policy**: install commands and examples quoted verbatim from repo READMEs with source links; test enforced by `lib/docs/content.test.ts`.

## Typography update addendum (2026-10-14, evidence-based)

- **Lato** (local statics Light/Regular/Bold, OFL-1.1) is the default English body/UI font; **Audiowide** (local Regular 400, OFL-1.1) is display-only for English headings/short phrases; **PNU** unchanged for Arabic; Orbitron retained for the mono/technical stack only.
- Lato 500/600 render as 400/700 per CSS fallback (no Medium/SemiBold files exist — verified by directory listing, not assumed).

## Inter/Roboto Mono addendum (authorized user request)

- **Inter** (`next/font/google`, 400/500/600/700) is the English UI font; **Roboto Mono** (`next/font/google`, 400/500/600) is selective for code. Google Fonts is fetched at build time and self-hosted at runtime — no browser requests to Google, so `font-src 'self'` still holds. This supersedes the former no-remote-fonts rule by explicit user authorization. Lato/Audiowide/Orbitron files remain on disk, unreferenced.
