# Design System Plan (Prompt 1, Phase 1)

Date: 2026-10-12 · Based on repository inspection (no rewrites before understanding).

## Existing UI architecture (observed)

- Next 16.4.0 + React 19.3.0 + TS 6.0.3 + Tailwind 4.3.3 (CSS-first `@import` + `@config` JS bridge) + Bun 1.4. No Radix, no cva, no motion lib, no toast lib; `lucide-react` 1.54.0 established. No browser tooling.
- CSS: `app/globals.css` (base, logical properties) + generated `app/tokens.css` from `tokens/design-tokens.json` (single source of truth, mirror enforced by `lib/tokens.test.ts`). Next.js font variables + local PNU @font-face (see tokens).
- Components: flat `components/*.tsx`. Brand layer `components/ui.tsx` (Button with `track`, Badge `tone`, Card, SectionHeading `level`, StatusDot, EmptyState) consumed by 9 routes — **preserve these export APIs**. Domain components: header/footer/palette/explorer/external-meta/docs-filter/locale-switch. Motion is CSS-only (hero glow, scroll reveals, `prefers-reduced-motion` honored).
- i18n: `[locale]` routes, `lang`/`dir`, logical CSS, per-locale directional arrows in text (correct); one gap: lucide `ArrowRight` in hero CTA doesn't flip in RTL.
- A11y: skip link, focus-visible, 44px targets, landmarks, live regions, focus-trapped palette. Assets: interim SVG mark only (official logo gap stands).

## Library strategy + compatibility evidence

- **shadcn/ui patterns adopted, CLI not run** (would scaffold a second system + overwrite config): hand-place `components/ui/*.tsx` in shadcn style with `components.json` for future CLI compatibility.
- **New deps (4, all tiny, React 19 compatible)**: `class-variance-authority` (variant API), `clsx` + `tailwind-merge` (`cn()`), `@radix-ui/react-slot` (Button `asChild` only). No other Radix: the palette dialog is already accessible + focus-trapped + tested — replacing it would duplicate a working primitive; popovers/menus/sheets have no consumer in the current UI.
- **Deferred with reason**: Motion/`motion` (CSS transitions suffice; no justified use case), Sonner (no transient-feedback flows — all forms are GET navigations), React Flow (ecosystem phase, not foundation), Aceternity/MagicUI (inspiration only, no copy-paste淘宝).

## Tokens & typography

Palette/typography/spacing/radii stay in `tokens/design-tokens.json` (single source of truth). Dark is the default (`:root`, background `#000000`); a full light palette lives under `colorLight` and is emitted as `:root[data-theme="light"]` plus a `prefers-color-scheme: light` no-JS fallback in `app/tokens.css`. Users switch via the header toggle (`components/theme-toggle.tsx`), which persists the choice in `localStorage`; a nonce-approved inline script in `app/[locale]/layout.tsx` applies it before first paint (no flash) and respects the strict CSP (no `unsafe-inline`). Tailwind color utilities resolve to `var(--color-*)` so every component — including the SVG charts and the circuit backdrop — follows the active theme, with no raw colors. The generator also emits shadcn-style semantic aliases (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--input`, `--ring`, `--radius`) pointing at the same values. Contrast policy unchanged (both palettes meet WCAG AA).

## Organization (no competing systems)

1. `components/ui/*.tsx` — shadcn-style primitives (button, badge, input, separator, skeleton).
2. `components/ui.tsx` — VeTwo brand layer composing primitives (same exports as today).
3. Domain components unchanged. `lib/utils.ts` — `cn()`.

## Risks

- Tailwind v4 `@config` bridge: new classes must come from the same theme file (mirror test guards; color tokens must resolve to `var(--color-*)`).
- RTL: flip directional icons (`rtl:rotate-180`); never translate identifiers/code.
- Bundle: 4 deps are tree-shakable/sub-kB except Slot (tiny); verify chunk sizes post-build.
- No-browser visual checks remain manual/outstanding.

## Phase 2 outcomes (2026-10-12)

Implemented: `lib/utils.ts` (`cn`), `components.json` (CLI-compatible), `components/ui/{button,badge,input,separator,skeleton}.tsx`, semantic token aliases in generated `tokens.css`, brand `components/ui.tsx` recomposed on primitives with unchanged export APIs, `SearchInput` integrated into docs/packages/explorer filters, hero CTA icon RTL flip, `localeTarget()` pure helper + tests, `IconButton`/`Container`/`Input`/`Skeleton`/`Separator` added. Deps added: `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.7.0`, `@radix-ui/react-slot@1.5.0`.
Verification: lint/typecheck pass, 94/94 tests, build pass, static 806K→838K (+32K), served HTML shows new ring/RTL/search classes, all routes 200 both locales. No-browser visual checks still outstanding.

## Neon-inspired transformation (2026-10-14, evidence-based)

- **Radii (narrowly scoped change):** control 14→8px, card 22→16px. New tokens: `--border-subtle`, `--shadow-card/elevated`, `--focus-ring/width/offset`, `--transition-fast/base`; mirrored into Tailwind (`borderRadius`, `boxShadow`) and `tokens.css`.
- **Type:** `.text-display` (Audiowide, EN-only, `clamp(2.5rem,5vw+1rem,4rem)`, tight tracking with `:lang(ar)` guard); Lato body; PNU Arabic unchanged.
- **Controls:** compact Button padding, active/disabled states, token focus ring; header/footer/section rhythm refined, no redesign of information architecture.
- Post-reset component set is minimal (`ui.tsx`, header/footer/locale-switch/logo/media-slot/hero-chart/reveal); older `components/ui/*` primitives no longer exist.

## Inter/Roboto Mono migration (authorized user request)

- **Type:** Inter (EN body/UI/headings via `next/font/google` variable) with `.text-display` clamp scale retained; Roboto Mono selective for `font-mono` code/identifiers; PNU Arabic unchanged with `:lang(ar)` guards.

## Reference study: Pier Gorelli (2026-10-21)

- Canonical reference spec: [`docs/design-references/pier-gorelli/design-system.md`](design-references/pier-gorelli/design-system.md) (evidence, VeTwo translation rules, adopt/adapt/avoid table, compliance workflow).
- Evidence library: `docs/design-references/pier-gorelli/screenshots/` (59 captures) indexed by `manifest.json` / `manifest.md`; measurements in `evidence/*.json`.
- Applied to VeTwo: numbered section headers (`[01]` mono + hairline via `SectionHeading index`), larger editorial section rhythm (`py-20 sm:py-24 lg:py-28`), section heading scale 30/36px.
- Not adopted: the reference's fonts, palette, custom cursor, preloader, smooth-scroll layer, outline text for Arabic, or any invented dimension/telemetry labels.
- Visual QA: `bun run visual:qa` (see `scripts/visual-qa.mjs`) writes captures to `.agent/reports/visual-qa/<timestamp>/`.

## Font-variable contract repair (2026-10-21)

- Defect: `app/tokens.css` (generated) stopped emitting `--font-sans/--font-arabic/--font-display/--font-mono` after the Inter/Roboto Mono migration, while `tailwind.config.js` and `app/globals.css` still consumed them. English text silently rendered in `system-ui` and mono labels in `ui-monospace`; Arabic was unaffected (PNU fallback).
- Fix: `scripts/generate-tokens.mjs` now emits the four font variables from `tokens/design-tokens.json` → `font.stacks` (`--font-sans`/`--font-display` → `var(--font-inter)`, `--font-mono` → `var(--font-roboto-mono)`, `--font-arabic` → local PNU). No stack values were hand-edited.
- Guard: `lib/tokens.test.ts` now asserts the four variables exist in the generated CSS and in the Tailwind config, so the contract cannot silently break again.
- Verified in Chromium: EN h1 → Inter 64px, mono labels → Roboto Mono; AR h1 and mono → PNU; axe 0 violations, no overflow in both themes at 1440/768/390.

## GSAP hero choreography + Puppeteer QA (2026-10-30, user-approved)

- **Animation:** `gsap@3.15.0` (runtime, core only) added. Home hero entrance and the FIG.01 units-dimension chart draw are one choreographed timeline in `components/hero-motion.tsx` (data-driven: `[data-hero]` items, `[data-hero-edge]`, `[data-hero-node]` in `components/hero-chart.tsx`); reduced-motion skips the timeline entirely, no-JS keeps the SSR-visible markup, context killed on unmount. The dead `.hero-enter/.hero-enter-late/.lattice-pulse/.menu-root/.menu-panel` CSS was removed (the mobile Menu button opens the CommandPalette dialog, not a `<details>` disclosure).
- **Browser tooling:** `puppeteer@25.16.0` (devDependency) + `scripts/puppeteer-qa.mjs` (`bun run qa:browser`): viewport/route matrix screenshots, console/page-error/failed-request/overflow/h1 gates, palette & mobile-menu open/Escape checks with open-state captures, reduced-motion animation gate, stepped reveal sweep for `--full`. Playwright + axe (`bun run visual:qa`) retained.
- **Evidence:** Puppeteer 18/18 clean (6 routes × 3 viewports); reduced-motion 2/2 (hero final state, no running animations); menu/palette open+Escape verified with open captured; axe 0 violations on /en,/ar,/en/services at 1440+390; lint (0 errors, 4 pre-existing warnings), typecheck, 111 tests, build pass. Screenshots: `.agent/reports/puppeteer-qa/2026-10-29_17-57-14…2026-10-30_13-40-07/`, `.agent/reports/visual-qa/2026-10-30_13-34-29/`. Reference re-verified live 2026-10-29; plan: `implementation-plan.md` in the reference directory.

## Motion and browser automation (verified 2026-10-29 in source)

Canonical reference for the design language this system implements: [`docs/design-references/pier-gorelli/design-system.md`](design-references/pier-gorelli/design-system.md). This file only records VeTwo's own implementation behaviour; it does not duplicate the reference analysis.

- **Hero entrance (GSAP).** `components/hero-motion.tsx` drives one `gsap.context()` timeline over `[data-hero]` items (badge → h1 → lead → CTAs → note → plate → meta strip), then draws the `HeroChart` SVG: runtime edges trace in staggered, nodes pop after. Guarantees: server HTML ships fully visible (hidden states are applied by JS at mount, so no-JS/crawlers never lose content); `prefers-reduced-motion: reduce` skips the timeline and gsap is never imported; the chart SVG is rendered server-side and only *animated*, never *held* at opacity 0; strict CSP respected. Cleaned up on unmount.
- **Scroll reveals.** `components/reveal.tsx` — IO-driven (`Reveal`, threshold 0.12, rootMargin `-8%`). Degrades to fully visible when `IntersectionObserver` is absent. Reduced-motion branch is a CSS rule, not JS.
- **Statement outline→fill.** `components/statement.tsx` — English only (stroked Arabic is not legible). Solid copy always holds the real text, so AT and no-JS read it. `--statement-fill` driven by one rAF-per-scroll-frame max; reduced-motion sets `--statement-fill: 1`.
- **Scroll progress.** `components/scroll-progress.tsx` — writes `--scroll-progress` (0..1) and `data-scrolled` on the document element via rAF; decorative, `aria-hidden`, no textual readout.
- **Navigation motion.** `components/primary-nav.tsx` — CSS `nav-roll` label swap on hover/focus (`0.4s cubic-bezier(.76,0,.24,1)`), route-aware `aria-current`. Mobile menu opens the command palette (`<dialog>`), not a drawer; ESC closes.
- **Circuit background.** `components/Logo/src/VeTwoCircuitBackground.tsx` — SVG-only identity layer, theme-aware, with its own `ReducedMotionPolicy`; quiet in light mode.
- **Reduced motion.** Global kill-switch in `app/globals.css` (`scroll-behavior: auto`, `animation-duration: 0.01ms`, `transition-duration: 0.01ms`) plus per-component branches. Verified: hero items reach opacity 1, no animations remain running after settle.
- **Puppeteer QA.** `scripts/puppeteer-qa.mjs` — deterministic capture matrix (`<route>-<w>x<h>[-<state>].png`) with bounded readiness (`document.fonts.ready` + animation quiescence with a hard 4s cap, no fixed sleeps), console/page/failed-request capture, horizontal-overflow detection, h1 count, reduced-motion assertions (hero opacity must be 1, no running animations after settle), menu/palette open+close+ESC, scroll-progress assertion, in-app link validation. Artifacts under `.agent/reports/puppeteer-qa/<timestamp>/` (untracked). Playwright + axe harness retained at `.agent/qa-harness/`.

## Known environment limitation (2026-10-29, resolved 2026-10-30)

Both `next dev` (Turbopack) and `next build` (Turbopack and `NEXT_TURBOPACK=0` Webpack) hang on the slow network `.next` filesystem (Next warns: "Slow filesystem detected. The benchmark took 4583ms").

**Workaround that unblocks the production build:** symlink `.next` to a tmpfs mount (`/dev/shm`, 3.9 GB free) and pass `--webpack` to `next build`. Next 16 defaults to Turbopack and the `NEXT_TURBOPACK=0` env var is **ignored** by the bun launcher — `--webpack` is the flag that works. With that, `bun run build -- --webpack` completes in ~8 min and `bun run start` serves on any port. `tsc --noEmit` and `vitest` complete without the workaround.

## Browser QA & Motion (verified 2026-10-30)

- **Full Puppeteer matrix:** 9 routes × 3 viewports = 27 captures, all clean (HTTP 200, h1=1, 0px overflow, 0 console errors, fonts loaded). Artifacts: `.agent/reports/puppeteer-qa/2026-10-30_16-10-30/` (report.json + 27 PNGs, 99–840 KB each, no blank pages). EN and AR both verified: EN body font resolves to `Inter, "Inter Fallback", PNU, system-ui, sans-serif`; AR body font resolves to `PNU, system-ui, sans-serif`; `dir` is `ltr`/`rtl` respectively.
- **Light-theme matrix:** 4 routes × 2 viewports with `--color-scheme l` = 8 captures, all clean. Artifacts: `.agent/reports/puppeteer-qa/2026-10-30_20-42-10/`. Theme switch verified to actually change rendered colors, not just the filename: dark `rgb(0,0,0)` bg / `rgba(255,255,255,0.10)` border → light `rgb(242,251,247)` bg / `rgba(10,15,13,0.12)` border.
- **Interaction matrix:** 4 routes × 2 viewports with `--menu --palette --reduced-motion --interactions` = 8 captures, all clean. Artifacts: `.agent/reports/puppeteer-qa/2026-10-30_16-28-56/`. Mobile menu opens the command palette (`<dialog>`), palette opens with ⌘K/Ctrl+K, reduced-motion leaves hero items at opacity 1 with no running animations, scroll progress rule updates, in-app links resolve.
- **Defect found and fixed:** `scripts/puppeteer-qa.mjs` reported a phantom failure on `/en/blog` and `/ar/blog` because those routes use `PageIntro` rather than `HeroMotion` and have no `[data-hero]` element. The reduced-motion assertion now skips routes with no hero instead of reporting `opacity=n/a` as a failure. No product defect — blog pages render correctly (verified in the matrix above).
- **Quantitative reference comparison:** `compare-refs.mjs` reads VeTwo's source-declared CSS (`app/globals.css` / `app/tokens.css`) against the Pier Gorelli reference's measured values (`docs/design-references/pier-gorelli/evidence/metrics.json`, 1440×900). 13 principles compared; 5 match/adopted, 3 adapted, 5 avoided — all per the adopt/adapt/avoid table in the canonical guide §7. Full table in `design-system.md` §13.
- GSAP: hero choreography + units-chart SVG draw (`components/hero-motion.tsx`); entry animation via `components/page-transition.tsx` (useGSAP). Cleanup via useGSAP scope.
- Reveal: `components/reveal.tsx` IntersectionObserver scroll reveals.
- Statement: outline-to-fill CSS animation.
- Reduced motion: global `prefers-reduced-motion` block; circuit background disables pulses.
- Puppeteer: `scripts/puppeteer-qa.mjs` (routes, viewports, interactions, reduced motion). Artifacts under `.agent/reports/puppeteer-qa/<ts>/`.
- Visual QA: `scripts/visual-qa.mjs`. Artifacts under `.agent/reports/visual-qa/<ts>/`.
- CSP: nonce-based strict CSP; `style-src-attr 'unsafe-inline'` for attributes. Known: 33 `style-src` console violations/page remain (GSAP/CSSOM inline styles) — under investigation.
- Canonical reference: `docs/design-references/pier-gorelli/design-system.md` (loaded via `kilo.json` instructions).
