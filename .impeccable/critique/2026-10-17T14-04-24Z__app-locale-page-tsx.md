---
target: homepage (app/[locale]/page.tsx)
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
p2_count: 3
target_identity: "file:/media/DATA/Programming/Projects/VeTwo/Vet-Projects/Website/app/[locale]/page.tsx"
target_fingerprint: "sha256:3d982ef391675bf402e555e580f89854a97469c36ba1c40aec5e496faaeeee68"
target_path: /media/DATA/Programming/Projects/VeTwo/Vet-Projects/Website/app/[locale]/page.tsx
timestamp: 2026-10-17T14-04-24Z
slug: app-locale-page-tsx
---
# Impeccable Critique — VeTwo homepage

Method: ⚠️ DEGRADED: single-context (no sub-agent/Task tool exposed in this session)
Target: `app/[locale]/page.tsx` (VeTwo homepage, EN + AR) · Mode: **Persuade**
Evidence: source read, production build (`bun run build`) served via `next start`, Playwright (Chromium) at 1280×900 / 390×844 / 320×700, axe-core WCAG 2.2 AA scan, `impeccable detect` CLI + browser overlay, keyboard/reduced-motion probes. All highlighters were stopped before reporting.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Sticky header, working JS-free mobile disclosure, smooth anchors — but no active/current-section indication while scrolling, and the language switch never shows the active locale. |
| 2 | Match System / Real World | 3 | Domain language is precise (dimensional exponents, manifest-verified, mono identifiers); the hero "note" is meta editorial policy ("No fabricated stats") that reads as internal copy. |
| 3 | User Control and Freedom | 3 | Static page, no traps, clear escapes; no back-to-top and nav is anchor-only. |
| 4 | Consistency and Standards | 4 | Cohesive tokens, typography, and surfaces. Header GitHub CTA re-declares the primary recipe instead of the `Button` component (invisible to users). |
| 5 | Error Prevention | 3 | No input surfaces; external links carry `rel=noreferrer`. Nothing error-prone to guard. |
| 6 | Recognition Rather Than Recall | 3 | Clear nav and labels; but linking the ecosystem edges back to the featured project cards requires recall, and chart node names are truncated. |
| 7 | Flexibility and Efficiency | n/a | Static marketing surface; no accelerators apply. |
| 8 | Aesthetic and Minimalist Design | 2 | Restrained and premium overall, but the 5-line hero headline monopolizes the first viewport, and the same large concentric-circle placeholder repeats three times. |
| 9 | Error Recovery | 3 | No error states on this surface; 404 handled elsewhere. |
| 10 | Help and Documentation | n/a | Docs live off this surface; no in-page help is expected. |
| **Total** | | **24/32** | **Good (75%)** |

## Design Specificity Verdict

**LLM assessment**: Genuinely authored for VeTwo, not category-interchangeable. The hero's dimensional-analysis chart is the strongest differentiator — base dimensions as measurement rails (Mass/Time/Energy/Currency/Count), catalogued packages as plotted nodes, runtime edges solid vs conceptual edges dashed, all from `lib/ecosystem/graph.ts`. Mono technical identifiers, evidence-labeled stats ("editorial or clearly labeled with its source"), and correct RTL bilingual composition signal "serious engineering effort." Weaknesses toward genericism: the asymmetric feature grid (1 large + 3 compact cards) and the two-column text/diagram split repeat three times down the page, and the English headline could sit on any open-source org's landing page.

**Deterministic scan**: `impeccable detect --json app components` → 0 primary findings (exit 0). `detect --json .` surfaced one unrelated advisory (`overused-font` on `lib/tokens.test.ts:59`) outside the reviewed surface. Browser overlay (`/detect.js`) found **3 × `tiny-text`** — the 11px placeholder captions in `components/media-slot.tsx:62` — which the regex/CLI pass cannot see (rendered font size). The overlay also reported 41 console entries, of which **34 are CSP inline-style violations in dev**; a production build (`next start`) repro shows **0 console errors** on `/en` and `/ar`, so the CSP noise is a dev-only false positive (React DevTools / Turbopack overlay), not a shipped defect.

**Visual overlays**: The detector script injected successfully (mutation preflight passed, `/detect.js` loaded) and logged its findings group to the console, but the page's strict nonce CSP (`style-src 'self' 'nonce-…'`) prevents the visible DOM overlay from being a reliable user-facing artifact. Treat the console output — 3 `tiny-text` captions — as the browser evidence.

## Overall Impression

A restrained, credible, well-engineered homepage that clearly means to be taken seriously, and mostly succeeds. The single biggest opportunity: the homepage's most product-specific asset — the units/dependency chart — is rendered small and illegible, while the largest visual real estate is given to a headline that overflows and to three identical placeholder boxes. Fixing legibility of the real diagram and the hero's typographic proportion would lift the whole page from "polished template" to "unmistakably VeTwo."

## What's Working

- **The hero chart is real, truthful, and on-brand.** Explicit dimension rails and dashed-vs-solid edge semantics encode the product's scientific rigor into the first visual — exactly what DESIGN.MD §10 asks for.
- **Bilingual parity is genuine, not bolted on.** Correct `dir=rtl`, mirrored hero, PNU for Arabic with `letter-spacing: normal` guards, and a locale switch that preserves the path. No Latin tracking leaks onto Arabic.
- **Restraint and correctness hold up under instrumentation.** axe-core found zero contrast/heading/landmark violations; no horizontal overflow at 320/390/1280; visible 2px focus outlines everywhere; `prefers-reduced-motion` fully neutralizes reveal and hero animations; the JS-free `<details>` menu opens correctly.

## Priority Issues

- **[P1] Header logo fails WCAG 2.5.3 (Accessible Name).**
  - **What**: `components/header.tsx:22` sets `aria-label="VeTwo home"` while the visible text is "V2VeTwo.dev" (`.gap-2.5`). axe-core flags `label-content-name-mismatch`, impact **serious**, on desktop, mobile, and 320px.
  - **Why it matters**: Speech-input and screen-reader users cannot activate the link by its visible name; it is the site's primary "return home" affordance.
  - **Fix**: Drop the `aria-label` (visible text already names it), or set it to contain the visible string, e.g. `aria-label="VeTwo.dev home"`.
  - **Suggested command**: `/impeccable audit`

- **[P1] Hero headline overflows its column and dominates the first viewport.**
  - **What**: `max-w-xl` on the `<h1>` plus `.text-display` (clamp up to 4rem) at 1280px wraps "Revolutionizing Veterinary care through Engineering & Code" to **five** lines; at 390px it takes four lines. It crowds the chart and pushes the page's focal visual into a small box.
  - **Why it matters**: First impression is controlled by a wall of headline rather than the product's distinctive diagram; the editorial "confident line break" goal (DESIGN.MD §4) is not met.
  - **Fix**: Widen the text measure on `lg` (e.g. `max-w-2xl`/`lg:max-w-[42rem]`) and/or lower the clamp ceiling so the line breaks fall deliberately (≈3 lines at desktop). Re-check the Arabic heading independently.
  - **Suggested command**: `/impeccable typeset`

- **[P2] Three identical large placeholders repeat down the page.**
  - **What**: `home.projects.featured-01`, `home.ecosystem.feature-visual`, and `home.engineering.architecture-visual` all render the same concentric-circle SVG (`components/media-slot.tsx`) at full card width, while the hero reserves a real chart.
  - **Why it matters**: DESIGN.MD §11 warns against repeated competing visuals; three look-alike placeholder boxes make the middle of the page read as a wireframe and flatten the emotional journey between hero and closing CTA.
  - **Fix**: Keep the slots (assets are user-supplied) but differentiate them — vary ratio/treatment per slot, or render distinct labeled placeholder motifs tied to each section's content (project grid, dependency lattice, layering).
  - **Suggested command**: `/impeccable layout`

- **[P2] The hero chart's node labels are illegible.**
  - **What**: `components/hero-chart.tsx` renders labels at `fontSize="10"` inside a 640-wide viewBox scaled to ~half column width on desktop and smaller on mobile, with names truncated via `short()` ("VeTwo-Market-P…"). Dimension rails ("Mass, Time, …") are effectively 8–9px on screen.
  - **Why it matters**: The page's single most product-specific visual cannot be read — the differentiator is present but not perceivable. The detector's `tiny-text` rule only covers HTML, so this is caught by inspection only.
  - **Fix**: Raise label size and contrast, reduce/curate plotted nodes, or let the diagram span full width with an accompanying legend; ensure all package names render untruncated.
  - **Suggested command**: `/impeccable typeset`

- **[P2] 11px placeholder captions fall below the documented type floor.**
  - **What**: `components/media-slot.tsx:62` uses `text-[11px]`; the detector's browser overlay flags 3 × `tiny-text` ("11px body text"). DESIGN.MD §4 sets compact metadata at 12–13px.
  - **Why it matters**: Sub-12px text is hard to read and widens the gap between implementation and the design system during media review.
  - **Fix**: Raise to `text-xs` (12px) or larger; it is a caption, not fine print.
  - **Suggested command**: `/impeccable polish`

## Persona Red Flags

**Jordan (First-Timer — veterinarian/producer/student):** The hero leads with "Open-source veterinary technology" then a five-line slogan; the stats bar says "verified dependencies 3" with no plain-language gloss and no way to learn what "verified" means. "Manifest-verified dependency" appears in the ecosystem list as body copy. The hero note explains the *site's* editorial policy instead of the *product's* purpose. Jordan cannot answer "what does VeTwo actually do for me?" from the first screen and will bounce before reaching the project descriptions.

**Riley (Stress Tester):** The homepage has no forms/empty states to break and holds up at 320px with no overflow — but the core credibility claim is unverifiable here: "verified dependencies 3" links nowhere, the chart node names truncate ("VeTwo-Market-P…"), and the ecosystem edges (`create-vetwo-pack → whisnew ^1.8.0`) are presented without a link to the source manifest. An inquisitive user hits a dead end exactly where the evidence promise is made.

**Casey (Distracted Mobile):** Touch targets pass (≥44px; the locale and GitHub controls are 44px). But the mobile header stacks logo + locale + GitHub + a separate "Menu" disclosure, and the 640×400 hero chart shrinks to ~360px wide with unreadable labels — the visual that should reward the scroll is the least legible element on the phone.

## Minor Observations

- **DESIGN.MD typography drift**: §4 approves IBM Plex Sans / Plex Mono / Plex Arabic, but the site ships Inter + Roboto Mono (authorized by AGENTS.md/PRODUCT.md). The documents disagree; reconcile DESIGN.MD so the design authority has one story.
- **Meta hero note**: "Every metric on this site is either editorial or clearly labeled with its source. No fabricated stats." reads as defensive internal copy; the evidence principle is better demonstrated than declared.
- **Stats mix units**: the four-up bar is three counts plus "primary language TypeScript" — a categorical value styled as a metric.
- **Header GitHub CTA inconsistency**: `components/header.tsx:35` hand-rolls `bg-accent … text-[#04110B]` rather than reusing `Button`'s primary variant, duplicating the recipe.
- **Ecosystem edge oddity**: `create-vetwo-pack → whisnew ^1.8.0` — verify "whisnew" is a real dependency id (not a typo), since the section's whole point is manifest verification.
- No active state in the nav; "Home/Projects/Ecosystem" all render identically on the homepage.

## Questions to Consider

- What if the units/dependency diagram — the one thing no generic SaaS page could show — were made the *hero* and the headline were its caption?
- Does the homepage need three full-width diagram sections, or would two (one real chart, one proof list) make the real visual louder?
- What would a plain-language "VeTwo in one sentence" line above the stats do for a first-time veterinarian?
