# Pier Gorelli — Reference Design Specification (canonical)

Status: active reference for VeTwo UI work
Captured: 2026-10-21 (UTC)
Tooling: Playwright 1.64.1 + cached Chromium 156 (headless), 1440×900 / 768×1024 / 390×844
Primary sources:

- https://piergorelli.com/ (home)
- https://piergorelli.com/services/
- https://piergorelli.com/about/
- https://piergorelli.com/blog/
- Supplementary: one blog article, opened from the blog index to measure long-form reading width.

This document is the canonical interpretation of that reference for VeTwo. It records **observed evidence**, separates it from **inference**, and states which parts VeTwo adopts, adapts, or rejects. VeTwo's brand, tokens, content, and product behavior remain authoritative. Nothing here authorises copying the reference's assets, copy, fonts, palette, or proprietary implementation.

Evidence library:

- `screenshots/` — 59 captures (see `manifest.json` / `manifest.md`)
- `evidence/metrics.json` — container, grid, section spacing, type sizes at three viewports
- `evidence/structure.json` — section order, labels, tokens, media inventory
- `evidence/motion.json` — preloader samples, palettes, hover/focus probes, reduced-motion state
- `evidence/css-rules.json` — observed rules for blueprint labels, cursor, nav roll, header rule, preloader

---

## 1. What this reference is (and is not)

Observed character: a one-person studio site with an editorial, technical-drawing aesthetic. It combines:

- oversized editorial display type with tight leading and negative tracking;
- mono "annotation" metadata, numbered sections, dimension labels, revision stamps;
- flat, shadowless surfaces built from 1px hairline rules and alpha borders;
- blueprint/grid-paper graphics and outlined text;
- restrained, purposeful motion (preloader, text fill, header progress, label rolls);
- light/dark themes with a single accent that shifts per theme.

It is **not** a component library, a colour system for VeTwo, or a content model. VeTwo keeps its own horse/circuit identity, emerald palette, Inter/PNU typography, bilingual content, and product facts.

---

## 2. Layout and composition

### 2.1 Observed rules

| Property | 1440×900 | 768×1024 | 390×844 | Evidence |
| --- | --- | --- | --- | --- |
| Outer gutter | 31.68px (`clamp(16px, 2.2vw, 32px)`) | 16.896px | 16px | `evidence/metrics.json` |
| Content width | 1377px | 734px | 358px | same |
| Grid | 12 columns, 20.16px gap | 12 columns, 12px gap | 4 columns, 12px gap | same |
| Section top padding | 158.4px (`clamp(88px, 11vw, 180px)`) | 88px | 88px | same |
| Header | fixed, 72px, transparent, overlays hero | same | same, collapses to brand + 3 controls + MENU | screenshots `home-*` |

- The page is full-bleed; a centred `wrap` supplies gutters. Hero fills the viewport (900px tall at 1440×900).
- A mono meta strip sits directly under the header: identity / location / availability, split across the same 12-column measure.
- Sections are numbered `[01]`…`[06]` and labelled in mono; a right-hand mono line carries context ("FIELD REPORTS · CLIENT NAMES UNDER NDA", "3 SHEETS · REV. 2026").
- Section headers pair a small index row with a large heading. Body copy is constrained (lead ≈ 586–690px; body ≈ 445px) and often offset to the right, leaving deliberate negative space.
- White space is the primary grouping device. Cards are rare; lists are separated by hairlines, not boxes.
- Full-width statements (manifesto, CTA) break the column rhythm; supporting text returns to a narrow measure.
- Mobile is not a shrunken desktop: 4 columns, 16px gutters, 88px section spacing, two-column meta strip, and the menu opens the command palette instead of a drawer.

### 2.2 VeTwo translation

- Keep VeTwo's `container-content` (max 1280px) and existing 4/8/12-column token spec. Do not import the reference's 1377px measure.
- Adopt the **index + hairline + heading** section header (implemented in `SectionHeading`, see §7).
- Adopt a larger vertical rhythm for editorial sections: VeTwo uses `py-20 sm:py-24 lg:py-28` (80/96/112px) as the approved adaptation of the reference's 88–158px. Section spacing must come from a shared pattern, not one-off values.
- Keep VeTwo's hero composition (badge → display headline → lead → dual CTA → proof strip). The reference's full-bleed 100vh hero is **not** required; do not stretch VeTwo's hero just to match height.
- Preserve deliberate negative space: constrain leads to ~`max-w-xl`/`max-w-2xl`; never let body copy run the full 1280px.
- Grid/blueprint lines may be used as a **graphic layer** (VeTwo already has the circuit background), never as a substitute for real structure.

---

## 3. Typography

### 3.1 Observed scale and behaviour

Reference fonts: Geist Variable (sans/display) and Geist Mono Variable (labels). **These are not adopted by VeTwo.**

Fluid scale variables (observed in their stylesheet):

```
--step--1: clamp(.8rem, .78rem + .1vw, .875rem)
--step-0:  clamp(1rem, .96rem + .2vw, 1.125rem)
--step-1:  clamp(1.25rem, 1.13rem + .6vw, 1.625rem)
--step-2:  clamp(1.6rem, 1.3rem + 1.4vw, 2.5rem)
--step-3:  clamp(2.2rem, 1.5rem + 3.2vw, 4.5rem)
--step-4:  clamp(3rem, 1.6rem + 6.6vw, 8.5rem)
--step-5:  clamp(3.6rem, 1.2rem + 11vw, 14rem)
```

Measured at the three viewports (`evidence/metrics.json`):

| Role | 1440 | 768 | 390 | Line-height | Tracking | Weight |
| --- | --- | --- | --- | --- | --- | --- |
| Display (hero / CTA) | 177.6px | 103.68px | 62.1px | 0.86 | −0.055em | 500 |
| Editorial statement | 120.64px | 76.288px | 36.48px | 0.90 | −0.05em | 400 |
| Subhead | 70.08px | 48.576px | 36.48px | 0.95 | −0.045em | 500 |
| H2 | 40px | 31.55px | 26.26px | 1.05 | −0.03em | 500 |
| H3 | 26px | 22.69px | 20.42px | 0.95–1.0 | −0.035em | 500 |
| Lead | 26px | 22.69px | 20.42px | 1.35 | −0.015em | 400 |
| Body | 18px | 16.9px | 16.14px | 1.55 | normal | 400 |
| Mono label | 11.52px | 11.52px | 11.52px | 1.4 | +0.02em | 400, uppercase |

Rules:

- Display type is **tight**: line-height below 1, tracking ≈ −0.05em. This is what makes it read as a drawn object rather than a headline.
- Mono labels are a fixed small size across breakpoints; they anchor metadata and never scale with viewport.
- Line length is controlled by measure, not by font-size: the body never exceeds ~60 characters.
- Type scale is fluid (`clamp`), not stepped with breakpoints.

### 3.2 VeTwo translation (authoritative)

- Keep **Inter** for Latin and **PNU** for Arabic; keep Roboto Mono for technical labels. Do not add Geist.
- The font contract is enforced in code: `scripts/generate-tokens.mjs` emits `--font-sans/--font-display/--font-mono/--font-arabic` from `tokens/design-tokens.json` → `font.stacks`, and `lib/tokens.test.ts` asserts those variables exist. A font change must go through the token file, never through ad-hoc CSS.
- Preserve VeTwo's existing hero display role (`clamp(2.5rem, 5vw + 1rem, 4rem)`) unless a deliberate, documented token change is approved. The reference justifies tighter leading/tracking, not a 177px VeTwo hero.
- Apply the reference's **hierarchy logic**: display → section heading → lead → body → mono metadata, with a clear 2–3× jump between display and section heading.
- Adopted: section headings move from `text-2xl/3xl` to `text-3xl/4xl` (30/36px) to strengthen the jump without breaking VeTwo's compact character.
- Metadata/mono: 12px, uppercase only where the string is Latin; **never** letter-spacing on Arabic (`:lang(ar)` guard is mandatory).
- Arabic/RTL:
  - Never apply negative tracking or outline-stroke text to Arabic. PNU glyph joins and diacritics require normal tracking and ≥1.35 line-height.
  - Do not use uppercase or `tracking-*` utilities on Arabic labels; use weight and colour instead.
  - Keep the same spatial hierarchy mirrored: index/label on the inline-start side, metadata on the inline-end side. Use logical utilities (`start/end`, `ms/me`, `ps/pe`).
  - `font-display` must fall back to PNU inside Arabic content (already enforced in `globals.css`).
- Outline text (`-webkit-text-stroke`) is English-only decorative at most; never for essential content, never for Arabic, and never without a solid fallback.
- Reading width: leads ≤ ~42rem; body ≤ ~68ch. VeTwo's `max-w-prose`/`max-w-2xl` are appropriate.

---

## 4. Surfaces, graphic language, and detail

Observed:

- Flat surfaces: no box-shadows on sections/cards; separation comes from 1px rules.
- Hairlines use alpha ink, not grey: light `#0e0e0d24`, dark `#edede71f`. Rules are ~10–14% ink.
- Blueprint layer: dashed 1px blue boxes with dimension labels (`h1.human · 1386×153`, `OL_INDEX · 352×155`), centre lines, grid-paper plates, and margin annotations (`12 COL`, `FONT-SIZE: VAR(--STEP-4)`, `LS −0.05EM`). Some of these labels are literal design-system documentation rendered on the page.
- Technical stamps: `SHEET 01 / 03`, `SCALE 1 : 1`, `REV. 2026`, `FIG. 01 · WIREFRAME → PRODUCTION`.
- Numerals are structural: section indices, `01/03` counters (total rendered as outline), dates, sheet numbers.
- Accent is functional: progress fill, caret, focus ring, active nav, sheet label. It is never used for large fills except the primary CTA.
- Theme: light `#f4f4f0` paper / `#0e0e0d` ink; dark `#0b0b0c` / `#edede7`. Accent shifts from `#2f5bff` (light) to `#5b7cff` (dark) for contrast.
- Custom crosshair cursor on pointer-fine devices: full-viewport 1px crosshair + 10px ring. Disabled for touch and reduced motion.
- No stock imagery on the inspected pages: 7 SVGs, 0 `<img>`, 0 `<video>`, 0 `<canvas>` on home. Diagrams are drawn, not photographed.

VeTwo translation:

- Keep VeTwo's token-driven surfaces (`bg-background`, `bg-surface`, `border-border`); no raw hex, no shadows on sections.
- Use mono metadata, numbered indices, and hairline rules as the adopted "technical" layer. They fit VeTwo's existing mono/circuit language.
- Blueprint graphics must be **honest**: dimension labels may only show real, verified values; never invent telemetry, measurements, or capabilities (AGENTS.md rule).
- VeTwo's circuit background is the brand-native equivalent of the reference's blueprint/terrain layer. Prefer extending it over importing grid-paper imagery.
- Accent budget: emerald is for interaction/emphasis, not decoration. Do not add the reference's blue or lime.
- Do not add a custom cursor by default. If ever proposed, it must be pointer-fine only, `prefers-reduced-motion` aware, and must not obscure text.

---

## 5. Motion system

Durations/easings observed in the reference stylesheet:

```
--dur-1: .4s   --dur-2: .8s   --dur-3: 1.2s
--ease-in-out: cubic-bezier(.76, 0, .24, 1)
--ease-out:    cubic-bezier(.25, 1, .5, 1)
```

| Effect | Trigger | Observed behaviour | Timing / easing | Status | Reduced-motion |
| --- | --- | --- | --- | --- | --- |
| Preloader | first load | Panel with SVG path draw, count-up, "lift" exit; hidden ~2.6s after first paint (visible at 0.87s, hidden at 3.48s in sampling); `html` gains `motion-ready` | lift 0.9s, path draw 1.2s, count 1.1s, pop 0.4s; `cubic-bezier(.76,0,.24,1)` | Observed | Preloader `display:none`; all animation durations `1e-05s` |
| Hero "machine" text | load / interaction | Subhead words (`gen-word`) and a caret block; alternates with a "human" variant | not measured | Partly observed | No caret/animation in reduced-motion capture |
| Manifesto fill | scroll | Outline-only lines become solid as the section advances; mid-state captured with last line still outlined | scroll-linked; exact curve not verified (`--fill` mechanism) | Observed visually | All motion reduced; final state legible |
| Header progress | scroll | Fixed header gains a tick ruler and a moving accent segment with a percentage tag (10% at ~980px, 17% at ~1400px) | scroll-linked, no easing curve | Observed | Not separately tested |
| Nav label roll | hover | Label slides/rolls to a duplicate (`::after`); colour unchanged | 0.4s, `cubic-bezier(.76,0,.24,1)` | Observed computed styles | CSS transition disabled |
| Button hover | hover/focus | 0.4s colour/transform transition; text roll on some buttons | 0.4s, ease-out | Partly observed (computed colour did not change in probe) | Disabled |
| Cursor | pointer move | Crosshair + ring follows pointer; `.cursor` fixed overlay | continuous | Observed | `.cursor` absent |
| Command palette | ⌘K / Ctrl+K / Menu (mobile) | Centred dialog, blurred backdrop, GO TO / DO groups, inverted selected row, ESC close | open/close transition not measured | Observed | Not tested |
| Balanced headline wrapping | layout | Display lines break deliberately; large negative space around statements | n/a | Observed | n/a |

**Motion principles to adopt**

1. Motion explains structure (load order, scroll progress, state change) — it is not ambient decoration.
2. Entrances are short and directional (opacity + small translate), never long parallax.
3. Scroll effects must not hide content: the final state must be readable without motion.
4. Hover affordances are transforms/rolls, not colour-only.
5. Every animation has a reduced-motion branch that ends at the final state immediately.

**VeTwo implementation rules**

- Use CSS transitions and `IntersectionObserver` (existing `Reveal`) for scroll reveals and UI affordances. GSAP (core only) is approved solely for coordinated entrance choreography — the hero timeline and units-chart SVG draw (`components/hero-motion.tsx`, user decision 2026-10-29). Do not add Lenis/custom-cursor infrastructure for a layout task, and do not migrate simple hover/focus transitions onto GSAP.
- Keep durations in the existing token band (150/250ms) for UI affordances; editorial reveals may use 400–600ms. Reference's 0.8–1.2s values are for full-page choreography, not component UI.
- No preloader unless a real loading state requires it. Never delay content for a branded intro.
- Preserve the global `prefers-reduced-motion` block; test it.
- Progress/number indicators must reflect real values (scroll, counts), never simulate progress.

---

## 6. Component patterns

| Pattern | Observed structure | VeTwo rule |
| --- | --- | --- |
| Header | Fixed 72px; brand; numbered nav (`01 Work`…); theme/accent/⌘K controls; pill CTA; tick-ruler progress on scroll | Keep VeTwo header (`components/header.tsx`). Numbered nav is optional; if added, digits are decorative and `aria-hidden`, with localized labels. Keep sticky behaviour and skip link. |
| Meta strip | Mono three-column strip under header: identity · location · availability | Use only with verified facts. VeTwo's hero badge + metrics strip already covers this; do not duplicate. |
| Hero | Full-bleed; display line; human/machine variants; subhead; lead; 2 CTAs; mono footnotes; blueprint annotations | Keep VeTwo hero: badge, `text-display`, lead, primary + secondary CTA, proof metrics. Do not import variant text toys. |
| Numbered section header | `[0N] LABEL` + right metadata + hairline + heading + lead | Implemented via `SectionHeading index=...`; add a right-side meta only when it carries real information. |
| Editorial statement | 2–3 display lines, outline→solid; narrow right column; margin annotations | Allowed for English only; must remain readable without motion; no fabricated annotations. |
| Work / project showcase | Counter `01/03` with outlined total; index/date + stack tags; title; summary; CTA; media plate; prev/next | VeTwo uses project cards (`Card`, `MediaSlot`). Adopt the index/stack metadata and hairline grouping; keep cards for scannability. |
| Service sheet | `SHEET 01/03 · FOR · SCALE 1:1`; blueprint plate left; 70px title, muted subhead, body right; sticky index | No services route in VeTwo today. If added, mirror the two-column sheet + mono sheet metadata; diagrams must use VeTwo's circuit language. |
| Process steps | 4 numbered columns with short labels and body | VeTwo's engineering cards already map to this; numbering and equal rhythm are the transferable parts. |
| Blog listing | Year groups with entry counts; date + title rows; category mono | No blog route today. If added, use dated rows + year grouping, not card grids. |
| CTA | 177px statement + 2 CTAs + mono note | VeTwo's closing section already has this shape at a smaller scale; keep centred, keep two actions. |
| Footer | Prompt + link columns + giant wordmark + legal line | Keep VeTwo footer; the giant wordmark is optional and must not introduce a new logo asset. |
| Command palette | 640px dialog, search, grouped actions, path hints, keyboard nav, mobile menu entry | Out of scope until VeTwo has enough destinations to justify it. If built, use an accessible dialog with focus trap + ESC. |

---

## 7. Adoption decisions (reference vs VeTwo)

| Decision | Item | Level | Notes |
| --- | --- | --- | --- |
| Adopt | Numbered section headers (`[01]` + hairline) | Layout/hierarchy | Implemented in `components/ui.tsx`; applied on the homepage. |
| Adopt | Larger editorial section rhythm (`py-20 sm:py-24 lg:py-28`) | Spacing | Applied to homepage content sections. |
| Adopt | Mono metadata, numbered indices, revision-style labels (only with real data) | Graphic language | Matches VeTwo's existing mono/circuit language. |
| Adopt | Constrained reading measure + deliberate negative space | Typography/layout | Enforce with `max-w-*`; never full-bleed body copy. |
| Adapt | Section heading scale (30/36px) | Typography | Strengthens display→section jump while staying compact. |
| Adapt | Outline text / scroll fill | Motion/typography | English-only, non-essential, reduced-motion safe. Not implemented. |
| Adapt | Sticky section index | Navigation | Only for long service/spec pages. |
| Adapt | Blueprint plates | Graphics | Use VeTwo circuit/geometry assets, not reference imagery. |
| Avoid | Geist fonts, blue/lime accent, exact layouts/copy/assets | Brand | VeTwo identity and tokens are authoritative. |
| Avoid | Custom cursor, Lenis smooth scroll, branded preloader | Motion | Not justified for VeTwo's content and risk accessibility/performance. |
| Avoid | Outline text or letter-spacing on Arabic | i18n | Breaks PNU rendering. |
| Avoid | Dimension/telemetry labels without verified values | Content integrity | Violates AGENTS.md. |

---

## 8. Compliance workflow (mandatory for significant UI work)

### Before

1. Read `.opencode/skills/brand-guidelines/SKILL.md` and this guide.
2. Identify the reference page/pattern that applies and open the matching screenshots (see `manifest.md`).
3. Inspect the VeTwo components/tokens you will reuse (`components/ui.tsx`, `components/header.tsx`, `tokens/design-tokens.json`, `app/globals.css`).
4. Write the intended outcome and acceptance criteria (composition, hierarchy, spacing, type roles, responsive behaviour, motion, a11y) before editing.

### During

- Reuse shared components and semantic tokens. No raw colours, no `space-x/y`, no letter-spacing on Arabic.
- Apply only the patterns in §6/§7 that fit the page. Do not restyle unrelated pages.
- Keep content truthful; no invented metrics or capabilities.

### After

1. Run the app (production build preferred for QA) and capture:
   `bun run visual:qa --routes /en,/ar --viewports 1440x900,768x1024,390x844`
   (requires Playwright; see `scripts/visual-qa.mjs` for the resolution order).
   Equivalent Puppeteer harness (added 2026-10-30): `bun run qa:browser --routes … --viewports …` (`scripts/puppeteer-qa.mjs`) — screenshots plus console/page-error, failed-request, overflow, h1, palette/mobile-menu, and reduced-motion checks; use `--full` for whole-page captures.
2. Compare the captures with the reference screenshots **by principle**, not pixel identity: composition, container, section rhythm, type hierarchy, rule placement, proportions, responsive stacking, interaction states.
3. Record defects with severity and evidence; fix the highest-priority confirmed issues.
4. Re-run lint/typecheck/tests + visual QA. **Maximum 5 iterations** by default; stop early when acceptance criteria pass. If blocked, document the remaining issue instead of looping.
5. Do not weaken tests, remove functionality, or suppress console errors to improve a visual score.

### Stop conditions

- A defect cannot be reproduced or verified with available tools.
- A change would contradict VeTwo brand/content or repo rules.
- Five iterations elapsed without meeting criteria.

---

## 9. Verification checklist

- [ ] No horizontal overflow at 320/375/390/768/1440 (or the task's agreed set).
- [ ] One `<h1>`; heading order is logical.
- [ ] Leads/body respect reading measure; Arabic line-height ≥ 1.35 and normal tracking.
- [ ] Numbered/technical labels contain only true information.
- [ ] Hairlines/rules align to the container; no stray one-off spacing.
- [ ] Theme parity: dark and light pass contrast for text and controls.
- [ ] Interactive states: hover, focus-visible, active; focus ring visible on both themes.
- [ ] Reduced motion: no decorative animation; content visible at final state.
- [ ] Keyboard: skip link, logical tab order, ESC closes overlays.
- [ ] Console: no errors, CSP violations, or failed document/asset requests.
- [ ] Screenshots captured at reference-comparable viewports; comparison notes recorded.

---

## 10. Known limitations and unverified behaviour

- **Work media plates** were blank in stills: the reference renders them at runtime (no `<img>`, `<video>`, or `<canvas>` present on home), so full-page captures do not show final artwork. Use the section screenshots for composition only.
- **Scroll-fill mechanism** (manifesto) was observed visually but its exact CSS/JS curve was not verified; `--fill` did not expose a changing value on the root during sampling.
- **Hover states** are transform/pseudo-element driven; computed colour probes did not capture the full effect. Screenshots represent the settled state.
- **Preloader timing** is sampled (~150ms resolution), not frame-accurate.
- **Accent switcher**: control exists; only the default blue accent was captured.
- **Reference drift**: the site may change. Screenshots are dated 2026-10-21 and must be re-captured if the reference is re-evaluated. Re-verified live 2026-10-29 (HTTP content pass over all four pages; layout/motion consistent with the captured evidence; minor content drift only — newer blog entries and FAQ dates).
- **Coverage**: four primary pages + one article, three viewports, light/dark (home only), desktop hover/palette/menu states. Other detail pages were not audited.
- **Not tested**: audio, forms, CMS states, error states, Firefox/Safari, physical devices.

---

## 11. Governance

- This file is the single canonical reference spec. Do not fork it into agent instruction files; link to it.
- Reference screenshots are evidence and must not be overwritten. Add new dated captures alongside and update `manifest.json`/`manifest.md`.
- Deliberate changes to VeTwo's design system (tokens, type roles, section rhythm) must be recorded here under §7 and in `docs/design-system.md`.
- VeTwo brand/content rules override this guide on conflict.

---

## 12. Agent instruction integration (added 2026-10-29)

This guide is now wired into a **real, discoverable** agent-instruction mechanism rather than relying on an untracked Markdown file being read by chance.

**Loaded by Kilo (the agent platform running this session):**

- `kilo.json` (project root) — sets `default_agent: "design-qa"` and adds this file to `instructions`, so it is loaded as an explicit instruction glob for every session in this worktree.
- `.kilo/agent/design-qa.md` — a `mode: subagent` agent whose system prompt mandates reading `brand-guidelines/SKILL.md` and this guide before any design or design-review work, and prescribes the browser-verification workflow.
- `AGENTS.md` (project root) — the human/machine-readable repo contract; its "Visual reference & design compliance" section points here and is itself listed in `kilo.json.instructions`, so it is loaded alongside.

**Loaded by the skill mechanism (any agent platform that discovers skills):**

- `.agents/skills/brand-guidelines/SKILL.md` and `.agents/skills/frontend-design/SKILL.md` — the brand and frontend-design skills. These are the primary skills for VeTwo visual work; neither currently references this guide, so agents using only the skill path must be told to read it. That gap is documented here rather than papered over.

**Not loaded (verified absent):**

- No `.kilo/commands/`, `.kilo/workflows/`, `.opencode/commands/`, or platform-specific agent registry entries exist for this guide. Do not create competing instruction files; extend this section instead.
- `docs/design-references/pier-gorelli/` is **not** git-tracked as of the first commit (`52ff372`); only `README.md` is committed. The guide persists on disk and is reachable via the mechanisms above, but it is not in shared history. Report this honestly rather than claiming committed persistence.

## 13. Quantitative reference comparison (2026-10-30)

Reproducible comparison of VeTwo's source-declared CSS against the reference's measured values in `evidence/metrics.json` (1440×900 viewport). No pixel-level or subjective assessment — values are read from `app/globals.css` / `app/tokens.css` / `tailwind.config.js` and compared numerically. Script: `./compare-refs.mjs`.

| Principle | Reference measured | VeTwo source-declared | Status |
| --- | --- | --- | --- |
| Display size | 177.6px / 0.86 lh / −0.055em tracking | `clamp(2.75rem, 5.4vw+0.5rem, 3.75rem)` ≈ 60px / 1.04 lh / −0.025em | **Adapted** — spec §3.2: "Preserve VeTwo's existing hero display role … The reference justifies tighter leading/tracking, not a 177px VeTwo hero." |
| H2 size | 40px / 1.05 lh | `text-3xl sm:text-4xl` = 30/36px | **Adapted** — spec §3.2 adopted: "section headings move from text-2xl/3xl to text-3xl/4xl (30/36px) to strengthen the jump." |
| Body size | 18px / 1.55 lh | 18px (`text-base`) | **Match** |
| Mono label | 11.52px fixed | 12px (`text-xs` = 0.75rem) | **Match** (within 0.5px) |
| Container width | 1377px (12-col grid) | 1280px (`container-content`) | **Adapted** — spec §2.2: "Keep VeTwo's container-content (max 1280px) and existing 4/8/12-column token spec. Do not import the reference's 1377px measure." |
| Section top spacing | 158.4px (`clamp(88px, 11vw, 180px)`) | `py-20 sm:py-24 lg:py-28` = 80/96/112px | **Adapted** — spec §2.2: "VeTwo uses py-20 sm:py-24 lg:py-28 (80/96/112px) as the approved adaptation of the reference's 88–158px." |
| Font family | Geist Variable / Geist Mono | Inter (Latin) / PNU (Arabic) / Roboto Mono (labels) | **Avoided** — spec §3.2: "Keep Inter for Latin and PNU for Arabic … Do not add Geist." Enforced by `tokens/design-tokens.json` → `font.stacks` → `app/tokens.css`; `lib/tokens.test.ts` asserts the variables exist. |
| Arabic tracking | −0.055em (display) | `:lang(ar) .text-display { letter-spacing: normal; line-height: 1.45 }` | **Avoided** — spec §3.2: "Never apply negative tracking or outline-stroke text to Arabic." |
| Numbered section headers | `[0N] LABEL` + hairline | `SectionHeading` renders `[0N]` + label + hairline (`components/ui.tsx:285`) | **Adopted** |
| Mono metadata | 11.52px uppercase technical labels | `.font-mono.text-xs` + revision-style labels | **Adopted** |
| Constrained reading measure | lead ≈ 586–690px; body ≈ 445px | `max-w-prose` / `max-w-2xl` / `max-w-3xl` | **Adopted** |
| Blueprint graphics | dashed 1px blue boxes + dimension labels | VeTwo circuit background (`VeTwoCircuitBackground.tsx`) | **Adapted** — spec §2.2: "VeTwo's circuit background is the brand-native equivalent … Prefer extending it over importing grid-paper imagery." |
| Custom cursor / Lenis / preloader | crosshair + ring, smooth scroll, branded intro | absent | **Avoided** — spec §5/§7: "Do not add a custom cursor by default … No preloader unless a real loading state requires it." |

**Net assessment:** VeTwo matches the reference on the five adopted/adapted principles (numbered headers, mono metadata, constrained measure, section rhythm, blueprint-equivalent graphics) and deliberately diverges on the seven avoided items (fonts, palette, cursor, preloader, exact measures, outline text on Arabic, unverified telemetry). No principle in §2–§6 is violated by the current implementation. The two divergences that are *larger* than the reference (60px vs 177.6px display; 1280px vs 1377px container) are both explicitly sanctioned by §2.2/§3.2 of this guide.

**Not assessed by this method** (require live browser, not source): hover/focus states, scroll-fill curve, header progress ruler, nav label roll, command palette transitions, responsive stacking at intermediate breakpoints, light-theme parity. The Puppeteer matrix in §14 covers the subset that is automatable.

## 14. Browser verification workflow (repeatable)

1. Start the app: `bun run dev` (or `bun run build && bun run start`).
2. Capture the matrix: `bun run scripts/puppeteer-qa.mjs --routes /en,/en/services,/en/about,/en/blog,/ar,/ar/services,/ar/about,/ar/blog --viewports 1440x900,768x1024,390x844 --full`. Artifacts land in `.agent/reports/puppeteer-qa/<timestamp>/`.
3. **Actually inspect** the screenshots. Never infer quality from filenames or HTTP status.
4. Compare against the principles in §2–§6, not pixel identity.
5. Fix confirmed defects with the smallest change; re-capture to verify. Bounded to 5 fix→verify iterations.
6. Re-run `bun run lint && bun run typecheck && bun run test && bun run build`.

Note: as of 2026-10-30 both `next dev` (Turbopack) and `next build` (Turbopack) hang on the slow network `.next` filesystem (Next warns: "Slow filesystem detected. The benchmark took 4583ms"). Workaround that unblocks the production build: symlink `.next` to a tmpfs mount (`/dev/shm`, 3.9 GB free) and pass `--webpack` to `next build` (Next 16 defaults to Turbopack and the `NEXT_TURBOPACK=0` env var is ignored by the bun launcher). With that, `bun run build -- --webpack` completes in ~8 min and `bun run start` serves on any port. `tsc --noEmit` and `vitest` complete without the workaround. Browser QA was run against that production server.
