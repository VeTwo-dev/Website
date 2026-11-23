# SEO & Discoverability

Last verified: 2026-11-05 · Scope: local production build (`next start`), desktop
fetch + Puppeteer. External validators (Google Rich Results Test, Schema Markup
Validator) were **not** called; JSON-LD is validated locally.

## Architecture

| Concern                                    | Owner                                          | Notes                                                                                                       |
| ------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `metadataBase`, fallback title/description | `app/layout.tsx`                               | Root fallback only; locale layouts override                                                                 |
| Locale template + OG/Twitter defaults      | `app/[locale]/layout.tsx` (`generateMetadata`) | EN/AR title template, default title/description, `og:locale` (`en_US`/`ar_AR`), default social card         |
| Per-page metadata                          | `lib/seo/page-meta.ts` (`pageMetadata`)        | Title, description, self-canonical, hreflang, OG/Twitter in one place                                       |
| Canonical + hreflang                       | `lib/seo/alternates.ts` (`localeAlternates`)   | Canonical is always the page's own locale URL; `x-default` → EN                                             |
| Article description + JSON-LD              | `lib/seo/jsonld.ts`                            | Real catalog copy only; escaping serializer                                                                 |
| Sitemap                                    | `app/sitemap.ts`                               | EN+AR entries, per-article `reviewed` dates, `xhtml:link` hreflang                                          |
| robots.txt                                 | `app/robots.ts`                                | Allows public content; disallows `/api/`, `/admin`, `/login`; references sitemap                            |
| Social card                                | `public/og.png` + `bun run og:generate`        | 1200×630, rendered from brand tokens, the official `public/icon.svg` mark, and the site's self-hosted Inter |

## Rules (do not regress)

- **Self-canonical per locale.** `/ar/*` pages canonical to `/ar/*`; never to
  `/en/*`. The `en`/`ar`/`x-default` hreflang triple is reciprocal on both.
- **Use `generateMetadata`, not a static `metadata` export, for locale pages.**
  Static exports cannot read `params`, which is how the Arabic canonicals
  silently pointed at English before this pass.
- **Every page defines `alternates`.** A page-level `alternates` object replaces
  the layout's, so omitting it drops hreflang entirely (documented in
  `docs/certification-audit.md`).
- **Home uses `absoluteTitle`.** Otherwise the title template doubles the brand.
- **No invented copy.** Descriptions come from `lib/i18n/dict.ts`
  (`pages.*`, `hero.*`) or the article catalog. Articles use the first prose
  paragraph (EN) or `summaryAr` (AR, enriched with the blog lead when short).
- **JSON-LD only for supported facts.** Article schema emits `dateModified`
  from `reviewed`; there is no `author` or `datePublished` because the catalog
  does not carry them. Home emits `Organization` with verified links only.
- **Login is non-indexable** (`robots: noindex, nofollow` + `Disallow: /login`).

## Generated social card

```bash
bun run og:generate http://localhost:3001
```

The script (`scripts/generate-og.mjs`) opens a real page so it can use the
shipped Inter faces and CSS variables, then replaces the body with the card and
writes `public/og.png` (1200×630). Re-run it only when brand tokens, the mark,
or the tagline change.

## Verification harness

```bash
bun run qa:seo  after-seo   # rendered HTML: title/desc/canonical/hreflang/OG/
                            # Twitter/JSON-LD/robots + sitemap URLs resolve
bun run qa:perf before-seo  # lab CWV: TTFB/FCP/LCP/CLS/INP proxy/bytes
bun scripts/seo-semantics.mjs after-seo   # landmarks, headings, link names,
                                          # alt text, focus ring, lang/dir
```

Artifacts: `.agent/reports/seo-validation/<label>/`, `.agent/reports/perf/<label>/`,
`.agent/reports/seo-semantics/<label>/`.

### Latest results (2026-11-05, local production)

- SEO validation: **PASS** — 10 representative routes, 32 sitemap URLs all 200,
  login `noindex`, 0 broken internal links.
- Semantics/a11y: **PASS** — one h1, no skipped heading levels, named links,
  visible focus ring, correct `lang`/`dir` in EN and AR.
- Transitions/GSAP/Lenis: 21/21 checks clean (see
  `docs/page-transitions.md` / `docs/smooth-scroll.md`).
- Browser QA: 24/24 route×viewport combinations clean at 1440/768/390.

Lab Core Web Vitals (median of two post-change runs at 1440×900, cold cache):
LCP 328–632 ms, CLS 0.000–0.002, TTFB 24–65 ms, JS ≈268–284 KB transferred,
0 long tasks, 0 console errors. These are local lab numbers, not field data.

## Known limits

- Hero entrance animation intentionally fades the h1 in after hydration; LCP
  measured 632–1456 ms across runs (variance), still inside the 2.5 s target.
  Removing the fade would change the reference-spec motion, so it stays.
- Nonce-based CSP makes locale routes dynamically rendered; TTFB is healthy
  locally but production caching must be verified on the real host.
- `/en` and `/en/` are still both served (Next default). Canonicals are
  absolute and self-referencing, so duplicates collapse in the index; a
  redirect requires host-level configuration.
