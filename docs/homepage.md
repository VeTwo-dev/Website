# Homepage Art Direction & Plan (ground-up rebuild)

Date: 2026-10-13 · Implemented and browser-verified (see outcomes).

## Direction

"Measurement bench": the hero media region is a **dimensional-analysis chart** — axis rails for the units engine's real base dimensions (Mass, Time, Energy, Currency, Count) with the 12 real packages plotted as nodes and the 3 manifest-verified runtime edges as solid traces. Subject-specific (it is literally what `units` computes), not a generic gradient hero. One bold element per viewport: the chart on desktop, the tagline typography on mobile.

- Palette: tokens only, theme-aware — dark canvas `#000000` (default) and light canvas `#F2FBF7` via `colorLight`; surfaces `#121A16`/`#18231E` (dark) and `#FFFFFF`/`#EAF6F0` (light); accents `#10B981` (dark) / `#0E9F6E` (light); secondary `#6EE7B7` (dark) / `#0B7A50` (light). No second palette.
- Type: Inter EN display/body, PNU AR, Roboto Mono for identifiers. Fluid display sizes, readable line lengths.
- Layout: start-aligned (direction-aware), 1280px container, generous section rhythm (py-16/24), 1px `border`-token borders, 16px card radii.

## Section order (all content verified or explicitly placeholder)

1. Header: brand mark + Home, GitHub ↗, language switch; mobile `<details>` disclosure (JS-free, keyboard-native).
2. Hero: badge, exact tagline h1, subtitle, primary CTA → `#projects`, secondary → GitHub org ↗; MediaSlot `home.hero.primary-visual` (16/10, chart composition).
3. Evidence strip: computed 12 documented / 5 published / 3 verified deps + TypeScript, labeled editorial.
4. Featured (`#projects`): editorial lead card (units, media `home.projects.featured-01` 4:3) + 3 compact cards (media `featured-02/03` 4:3 on lead variants only — compact cards text-only to avoid identical-card repetition); all repo links verified.
5. Ecosystem preview: native SVG mini-diagram of the 3 verified edges + link list; MediaSlot `home.ecosystem.feature-visual` (4:3) reserved for the future rich diagram.
6. Engineering: philosophy trio (dict p1–p3, README-sourced) + MediaSlot `home.engineering.architecture-visual` (4:3); `mg/kg ≠ %` motif.
7. Closing: dict closing + CTAs (GitHub, #projects). Footer: brand, tagline, GitHub/npm verified links, rights.

Omitted: testimonials, metrics dashboards, docs links (routes don't exist — no dead links), search UI, telemetry.

## Motion (CSS only, no new deps)

Hero entrance once (fade/slide, SSR-visible default), IO-driven reveals, hover lifts, details-menu transitions. Global reduced-motion kill-switch already in `globals.css`. No particle/3D/cursor systems.

## Data & destinations

`lib/projects/data.ts` (names/descriptions/repos), `lib/ecosystem/graph.ts` (edges), `lib/i18n/dict.ts` (all copy EN+AR). Destinations: `#projects` anchor, GitHub org/repos, npm package pages (5 mapped only). No invented numbers, statuses, or links.

## Risks

- No-browser visual checks (record honestly); served-HTML + screenshots via Playwright where possible.
- Orbitron long-form readability: observe, document, don't swap fonts.
- Placeholder captions must stay subtle, bilingual, non-debug.

## Phase 2 outcomes (2026-10-13)

Implemented as planned. Browser-verified (Chromium, prod build): hero/media/evidence/cards/edges/closing/footer render as designed EN+AR; mobile menu opens/closes without overflow; keyboard focus visible with 2px ring; anchor navigation works; Orbitron/PNU computed correctly; zero console/page/network errors; no remote font requests. One refinement from screenshots: none required beyond confirming the geometric zero glyph is by design (coverage API verified). Outstanding: real user media to replace the 4 placeholders; viewport widths beyond 1440/390 spot-checked only via those two.
