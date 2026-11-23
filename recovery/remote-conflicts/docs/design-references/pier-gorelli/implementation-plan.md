# Implementation Plan — VeTwo Website (Pier Gorelli reference pass v2)

> **Current status (updated 2026-10-30):** This plan is **historical and fully executed**. The work it describes under §C (GSAP hero timeline + chart draw), §E (Puppeteer dependency), and §F/G (capture matrix, interaction tests, build) is **implemented and verified in the repository**. Do not re-execute it. Use §A (information architecture) as the verified route map and §B as the design-system contract; §C/D/E/F/G are retained as evidence of why the systems exist and how they are verified.
>
> **Browser verification of this pass:** complete (2026-10-30). Production build succeeds into a real `.next` directory (`next build` + `next start` verified clean); the former environment blocker was the `/dev/shm` symlink's wiped target. Verification evidence: Puppeteer 18/18 clean routes × viewports, reduced-motion/light/palette/mobile-menu state checks, axe 0 violations, lint/typecheck/111 tests/build passing — recorded in `docs/design-system.md` (2026-10-30 entry).
> **Persistent agent instructions:** wired via `kilo.json` (`default_agent: "design-qa"`, `instructions` glob pointing here + `AGENTS.md`) and `.kilo/agent/design-qa.md`. See `design-system.md` §12.

Reference evidence: `docs/design-references/pier-gorelli/design-system.md` + `screenshots/` (captured 2026-10-21). Reference re-verified live 2026-10-29 via HTTP fetch (piergorelli.com reachable; content consistent with the captured evidence, minor drift: newer blog entries — no layout/motion change implied).
User decisions (2026-10-29): Puppeteer is added as a real dev dependency **alongside** the existing Playwright/axe harness; GSAP is adopted **where justified** (orchestrated hero choreography), keeping CSS for simple affordances.

---

## A0. What is already done (verified in source, 2026-10-29)

| Plan item | State | Evidence |
|---|---|---|
| §C row 1 — GSAP hero timeline | Implemented | `components/hero-motion.tsx` (gsap.context, reduced-motion guard, no-JS visible) |
| §C row 2 — SVG chart draw | Implemented | `components/hero-chart.tsx` + `[data-hero-edge]`/`[data-hero-node]` hooks |
| §C rows 3–8 — reveals, statement fill, scroll rule, nav roll, menu/palette, circuit | Implemented | `components/reveal.tsx`, `components/statement.tsx`, `components/scroll-progress.tsx`, `components/primary-nav.tsx`, `components/command-palette.tsx`, `components/Logo/src/VeTwoCircuitBackground.tsx` |
| §E — `gsap` + `puppeteer` deps | Installed | `node_modules/gsap` 3.15.0, `node_modules/puppeteer` 25.16.0; browser binaries cached in `~/.cache/puppeteer` and `~/.cache/ms-playwright` |
| §E — `scripts/puppeteer-qa.mjs` | Implemented | full matrix capture + interaction/reduced-motion/menu/palette checks |
| §F — verification plan | Partially executed | prior captures in `.agent/reports/` (2026-10-21 reference, 2026-10-29 puppeteer-qa); **no fresh capture of the current code state exists** — this is the open item |
| §G steps 1–2, 8 | Done | plan authored; agent instructions wired (this task) |

## A1. Information architecture (verified against the running app)

All four primary routes already exist and are retained with their section sequence (no new routes):

| Route | Section sequence |
| --- | --- |
| `/[locale]` (home) | Hero (badge → display → lead → dual CTA → FIG.01 units-dimension chart) → meta strip → statement → `[01] SELECTED WORK` (Project WorkRows) → `[02] ECOSYSTEM` (verified edges + FIG.02 plate) → `[03] ENGINEERING` (3 numbered principles) → `[04] NEXT` (closing CTA) |
| `/[locale]/services` | PageIntro → statement → `[01]` four capability layers → `[02]` principles → MetaRow → CTA band |
| `/[locale]/about` | PageIntro → statement → `[01]` four positions → MetaRow → CTA band |
| `/[locale]/blog` | PageIntro + verification notice → year/section-grouped dated rows → CTA band |
| `/[locale]/blog/[slug]` | Article body (verified sources; code blocks, callouts, tables) → resources |

Shared: fixed 72px Header (skip link, brand, numbered PrimaryNav, theme/locale/⌘K controls, GitHub), Footer (tagline, 3 link columns, oversized wordmark, legal), CommandPalette, ScrollProgress.

Content sources retained (never invented live): `lib/projects/data.ts`, `lib/ecosystem/graph.ts` (manifest-verified edges only), `lib/docs/content.ts` (README-quoted install commands), `lib/i18n/dict.ts` (EN + AR).

## B. Design system plan (preserve-first)

VeTwo tokens are authoritative and unchanged: background `#0A0F0D`, surface `#121A16`, elevated `#18231E`, text `#ECFDF5` / `#9CA3AF`, soft `#6EE7B7`, accent `#10B981`, warning/danger/info as specified. Typography unchanged: Inter (EN, `next/font`), Roboto Mono (labels/code, selective), PNU (Arabic, local; `:lang(ar)` guard: no letter-spacing, line-height ≥ 1.35). No new tokens required by this pass. Brand assets: no official horse-head logo exists in-repo (`docs/logo-inventory.md`) — the interim geometric mark remains and is labeled interim; do not recreate the official logo.

Design-language rules carried over from the canonical spec: hairline rules, mono metadata, numbered indices only where truthful, `max-w-*` reading measures, `py-20 sm:py-24 lg:py-28` editorial rhythm, emerald accent budget reserved for interaction/emphasis.

## C. Animation matrix

Existing system (verified in source): CSS `hero-enter` (0.7s, 2 phases), IO-based `Reveal` (0.55s, no-JS visible, reduced-motion safe), rAF-driven `statement` outline→fill via `--statement-fill`, `ScrollProgress` rule, CSS `nav-roll`, JS-free `<details>` mobile menu, `<dialog>` command palette, SVG circuit background with `ReducedMotionPolicy`.

This pass adds GSAP **only** where orchestration genuinely improves comprehension; everything else stays in its current (and cheaper) technique.

| # | Page/section | Purpose | Trigger | Target | Technique | Timeline | Responsive | Reduced motion | Performance risk | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Home hero | Establish load order: identity → message → actions → evidence | Load (after mount) | Badge, h1, lead, CTAs, note, plate, meta row | **GSAP timeline** (replaces 2-phase CSS `hero-enter` init) | Stagger ~0.06s, items rise 14px + fade 0.6s, `power2.out`; chart draw rides the plate's completion (2-phase) | Identical choreography at all breakpoints; mobile has no plate extent change | Skip timeline entirely; GSAP not imported to run (matchMedia guard) — final state | gsap core only; single timeline, no per-frame work | Puppeteer: screenshot at settle; `prefers-reduced-motion` run shows final state instantly; console clean |
| 2 | Home hero chart | Show the units-engine data structure forming: edges trace, nodes populate | Hero timeline phase 2 | HeroChart SVG (edges, dimension rails, nodes) | **GSAP SVG** (stroke-dasharray draw + node scale/fade stagger) | Edges ~0.4s each staggered 0.12s; nodes pop 0.35s staggered 0.03s after edges | Static chart ≥ 768px (chart is horizontally scrolled on ≤ 640px); animation runs inside the scroll container only once | Static final state (SVG is fully rendered server-side) | One-time SVG draw; SVGGeometryElement length lookups on mount; cleanup via gsap context | Puppeteer hero screenshot before/after settle; DOM check final state when reduced-motion |
| 3 | Scroll reveals (work rows, process steps, plates) | Directional entrances on scroll | IO 0.12 −8% rootMargin | Row/card containers | **CSS + IO (unchanged)** | 0.55s ease, optional per-row delay | Same | Final state immediately (media query) | IO only, no rAF | visual:qa sweep already triggers all reveals; overflow/console checks |
| 4 | Statement outline→fill | Reading rhythm through the manifesto | Scroll | `.statement-solid` clip-path | **rAF + CSS var (unchanged)** | scroll-linked band 85%→25% viewport | Same | `--statement-fill: 1` | One rAF-per-scroll-frame max | visual:qa + reduced-motion capture |
| 5 | Header scroll rule | Progress affordance | Scroll | `--scroll-progress` scaleX | CSS transform (unchanged) | — | — | — | transform-only | puppeteer scroll assertion |
| 6 | Nav label roll | Hover affordance | hover/focus | `.nav-roll-label` duplicate | CSS (unchanged) | 0.4s cubic-bezier(.76,0,.24,1) | Desktop nav only (nav is `hidden md:flex`) | transitions disabled | none | hover screenshot |
| 7 | Mobile menu / palette | Opening state | user action | CommandPalette `<dialog>` (the mobile "Menu" button is a `variant="menu"` PaletteTrigger — no `<details>` disclosure exists) | CSS dialog (unchanged) | — | mobile 4-col | — | none | Puppeteer open/close/ESC/keyboard test |
| 8 | Circuit background | Identity layer, quiet by default | continuous, subtle | SVG pulses | existing component with its own reduced-motion policy | — | — | ReducedMotionPolicy `auto` | SVG-only, no canvas | visual:qa |

GSAP hygiene: one `gsap.context()` per mounted component (hero), cleaned up on unmount; `gsap.matchMedia()`-equivalent manual reduced-motion guard; timeline does not gate content visibility (all initial hidden states are applied by JS at mount → no-JS users see everything; the HeroChart SVG ships rendered server-side and is only *animated*, never *held*).

## D. WebGL / Canvas specification — evaluated, not adopted

Assessment against the decision order (CSS → SVG → Canvas → WebGL):

1. The identity visual (architecture motif) is already the SVG `VeTwoCircuitBackground` — hand-drawn circuit traces on GPU-free rendering, theme-aware, CSP-safe, reduced-motion aware.
2. No scene in the current IA has a role that requires per-pixel/GPU work: the hero chart is structural SVG data; the ecosystem figure is metadata; there is no real telemetry stream (the content policy *forbids* simulated live telemetry unlabeled), so an ambient WebGL "telemetry" scene would violate both the content-integrity rule and the motion budget.
3. Mobile + strict-CSP + performance budget favors staying at SVG. Adding Three.js/WebGL would add ~150–600KB for zero communicative gain.

**Future trigger for adoption:** a verified real-data stream (farm telemetry labeled as demo, or a package-dependency force graph) that per-frame renders — then a Canvas 2D scene, WebGL only if shader-class effects are required. Fallback rules at that point: static SVG snapshot, reduced-motion paint-once, context-loss handling, pause when off-screen.

## E. Dependency and tooling plan

| Dependency | Scope | Purpose | Notes |
| --- | --- | --- | --- |
| `gsap` | runtime | Hero timeline + SVG chart draw (core only) | Free standard license; tree-shaken import of `gsap` core; NO premium plugins assumed |
| `puppeteer` | devDependency | Reusable browser QA utility + reference comparison | Chrome for Testing downloaded at install to user cache (`~/.cache/puppeteer`) — never in-repo; do not use unsafe launch flags; do not install `puppeteer-core` alongside |
| Playwright + `@axe-core/playwright` (existing, `.agent/qa-harness/`) | untracked tooling | axe a11y + `bun run visual:qa` overflow/console pipeline | retained; not removed by the Puppeteer addition |

Tooling artifacts: Puppeteer QA screenshots under `.agent/reports/` (untracked), deterministic naming `<route>-<w>x<h>-<state>.png`, cleanup of browser instances on exit (including signal exit), no fixed sleeps — navigation + settle on `document.fonts.ready` and animation quiescence.

## F. Verification plan

- Viewport matrix: 1440×900, 768×1024, 390×844. Routes: `/en`, `/en/services`, `/en/about`, `/en/blog`, `/en/blog/getting-started` + `/ar` equivalents minus article. Color schemes: dark + light (spot). Mobile menu open state, palette open, hover states, reduced-motion run.
- Checks per capture: status 200, no console/page errors, no failed requests, no horizontal overflow (>1px), one h1, fonts loaded, screenshots settled.
- Accessibility: axe via existing harness tags `wcag2a/aa/wcag21a/aa` on sampled routes; keyboard walk of nav/palette/menu; focus-visible.
- Animation verification: hero timeline fires once and finishes (screenshot after settle ≡ reduced-motion screenshot final state); scroll assertions for statement fill; hover roll; mobile menu; palette ⌘K.
- Project gates: `bun run lint`, `typecheck`, `test`, `build`; bounded visual-fix loop (≤ 5 iterations by default).

## G. Implementation sequence (historical — see §A0 for current state)

1. Install `gsap` + `puppeteer`; verify Puppeteer smoke test (launch → open page → title → screenshot → close). [done]
2. Author this plan (done with this file). [done]
3. Implement hero GSAP timeline + chart draw animation behind a reduced-motion guard; keep no-JS visible. [done]
4. Build the reusable Puppeteer QA utility (`scripts/puppeteer-qa.mjs`), run capture matrix, inspect screenshots against the reference spec's principles (composition, rhythm, hierarchy — not pixels). [utility done; fresh matrix capture blocked on environment — see §H]
5. Fix defects, re-capture (≤ 5 loop iterations). [not executed — no fresh captures to act on]
6. Interaction + a11y tests (menu, palette, ESC, reduced motion, RTL/AR spot check). [utility supports these; not executed this pass]
7. Run lint/typecheck/test/build; fix regressions. [partial — see §H]
8. Update `docs/design-system.md` + `manifest.md` (reference drift note: verified live 2026-10-29), AGENTS.md pointer already exists — extend it to mention GSAP/Puppeteer usage and this plan. [done this pass]
9. Deliver evidence-based report. [this pass]

## H. Status of this pass (2026-10-29)

**Done:**
- Repository state re-verified from source (not assumed): all four primary routes + blog article routes exist and are wired; GSAP hero timeline, `Reveal`, statement outline→fill, scroll progress, nav roll, command palette, locale switch, and circuit background all present in source.
- `gsap` 3.15.0 and `puppeteer` 25.16.0 import cleanly; browser binaries cached (`~/.cache/puppeteer`, `~/.cache/ms-playwright`).
- Persistent agent instructions wired: `kilo.json` (`default_agent: "design-qa"`, `instructions` glob → `AGENTS.md` + this canonical guide) and `.kilo/agent/design-qa.md` (subagent that mandates reading `brand-guidelines/SKILL.md` and this guide before design work, and prescribes the browser workflow). Verified against the `kilo-config` skill's config-loading rules.
- Canonical guide extended with §12 (agent instruction integration, including the honest note that `docs/design-references/pier-gorelli/` is **not** git-tracked) and §13 (repeatable browser workflow + the build-hang limitation).
- `docs/design-system.md` updated to cover GSAP/Reveal/scroll-progress/nav-roll/statement/puppeteer/reduced-motion and to link to the canonical guide rather than duplicate it.

**Blocked on environment (not code):**
- `next dev` (Turbopack) hangs after "Compiling /[locale] …"; `next build` hangs at "Creating an optimized production build …" on both Turbopack and `NEXT_TURBOPACK=0` Webpack. The `.next` directory sits on a slow network filesystem (Next warns: "Slow filesystem detected. The benchmark took 4583ms"). No production server can therefore be started, so **no fresh browser screenshot matrix could be captured** and no browser-based visual comparison or defect-fix iteration occurred this pass.

**Resolved 2026-10-30:** the build hang was an environment constraint, not a code defect. Workaround: symlink `.next` to a tmpfs mount (`/dev/shm`, 3.9 GB free) and pass `--webpack` to `next build` (Next 16 defaults to Turbopack and the `NEXT_TURBOPACK=0` env var is ignored by the bun launcher). With that, `bun run build -- --webpack` completes in ~8 min and `bun run start` serves on any port. The full Puppeteer matrix was then captured and is clean.
- `tsc --noEmit` and `vitest` complete (results in the final report).

**Remaining / incomplete:**
- Fresh 24+ screenshot matrix (8 routes × 3 viewports + interaction states) — blocked.
- Confirmed visual defects identified by inspecting captures — not possible without captures.
- Bounded fix→verify loop (≤5 iterations) — not executed.
- Browser-based accessibility, reduced-motion, and RTL interaction checks — not executed.

**No code changes were made to the website this pass**, so no regressions were introduced. The implementation is byte-identical to its pre-task state apart from the documentation and agent-instruction files added here.
