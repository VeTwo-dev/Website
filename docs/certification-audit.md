# Certification Audit — Phase 1 Report (Prompt 5)

Date: 2026-10-12 · Baseline (all executed, non-destructive): `bun run lint` PASS · `bun run typecheck` PASS · `bun run test` 63/63 PASS (3 integration skipped without env) · `bun audit` 1 transitive HIGH (see below). No browser, a11y-scanner, or Lighthouse tooling installed; no system browser — browser checks are manual/outstanding.

## Critical — none confirmed.

## High

1. **Mongo `$regex` built from raw user input (ReDoS)** — `lib/db/repository.ts:50-55` passes `q` (≤100 chars, but regex metacharacters allowed) into `$regex`. A crafted pattern (e.g. nested quantifiers) can cause expensive backtracking server-side. Repro: `GET /api/v1/public/projects?q=((((((.*` with a configured DB. Fix: escape regex metacharacters; add test. (Static fallback uses `.includes`, safe.)

## Medium

2. **Missing `<h1>` on 5 index pages** — projects, docs, ecosystem, packages, about use `SectionHeading` (`<h2>`) with no `<h1>` (verified by grep; only home/detail/article/error pages have one). Fix: `level` prop, one h1 per page.
3. **Rate-limiter Map grows unbounded** — `lib/security/rate-limit.ts` never evicts entries (per-IP memory growth). Fix: cap + prune expired on insert; test.
4. **Health endpoint has no rate limit** — `app/api/v1/public/health/route.ts` triggers a DB ping (5s timeout) with no limit, unlike all other public APIs. Fix: same 100/min bucket.
5. **Command palette has no focus trap** — `components/search-palette.tsx`: Tab can leave the modal dialog. Fix: trap Tab within dialog; test the pure helper.

## Low

6. **Filter pills / sidebar links under 44px** — catalog category/status pills (`py-1.5`), docs sidebar links (`py-2`), footer links have no minimum touch size. Fix: `min-h-[44px]` on interactive pills/links.
7. **Trailing-slash duplicates** — Next serves `/en` and `/en/` identically with no normalization; mitigated by absolute canonicals. Fix: document; no code change (redirect behavior unverifiable without prod).
8. **404 indexability unverified** — whether `/_not-found` emits noindex must be confirmed from served output (smoke check in Phase 2).
9. **`robots.ts` legacy `host` field** — harmless; leave (Next ignores/deprecates, still emitted).

## Informational / accepted

- **CSP keeps `style-src 'unsafe-inline'`** (required by Tailwind + Google Fonts; no `unsafe-eval`; nonces deferred with reason recorded in `docs/security.md`). Verified working with fonts/images/integrations.
- **`bun audit`: 1 HIGH transitive** — `braces@3.0.3` via `eslint-config-next > fast-glob > micromatch` (dev-only lint toolchain; no user input reaches it in this app). No churn per scope rules; re-audit on upstream fix.
- **Trailing `img-src https:/blob:` broader than needed** — no remote/blob images used; left as-is to avoid breaking future approved assets without deployment verification. Documented.
- **Secret/prod-URL scans clean**; all `target=_blank` carry `rel=noreferrer`; upstream hosts fixed + allow-listed; JSON-LD is the only `dangerouslySetInnerHTML` (static literal, safe); analytics sends event names only; cookies: none.

## Preserved controls (verified working)

Server-only DB + credentials; allow-list projections (no `_id`/tokens in responses — asserted in tests); Zod-bounded inputs; 400/404/429 shapes with `Retry-After`; refresh-if-stale cache with provenance; honest unknown/unavailable states; EN/AR `lang`/`dir`, logical CSS; sitemap/robots/canonical/hreflang/OG/JSON-LD; CI (frozen lockfile, lint/type/test/build), Dependabot, CODEOWNERS.

## Unavailable verification (needs prod/browser/human)

Viewport rendering (375–1920), screen reader, contrast measurement, Core Web Vitals/Lighthouse, domain redirects/HSTS effect, secret-scanning/push-protection settings, legal/consent review.

## Phase 2 outcomes (2026-10-12)

Fixed: H-1 regex escaping (`escapeRegExp`, literal-substring search preserved); M-2 one `<h1>` per index page (`SectionHeading level`, served HTML verified); M-3 limiter eviction cap (`MAX_BUCKETS`, tested); M-4 health rate limit; M-5 palette focus trap (`wrapFocusIndex`, tested); L-6 44px targets on catalog pills/docs sidebar/footer links.
New finding during verification: per-page `alternates` replace layout `alternates` in Next.js metadata merging, silently dropping hreflang — fixed with `lib/seo/alternates.ts` (`localeAlternates()` on all 8 page metadata definitions); served HTML now shows canonical + en/ar/x-default triple on both locales (attribute renders as `hrefLang`, valid HTML).
Verified live: h1 ×5 pages, 404 status + `noindex`, all 6 security headers, API warm latency 26–40ms (5.6s cold-start once), ReDoS input 200 in 22ms, all pre-existing routes 200.
Left open: Low-7 (trailing-slash duplicates, canonical-mitigated), Low-9 (`robots.ts` legacy `host`, harmless), Informational items (CSP `unsafe-inline` for styles, `braces` transitive HIGH dev-only, broad `img-src`), and all unavailable-verification items above.
