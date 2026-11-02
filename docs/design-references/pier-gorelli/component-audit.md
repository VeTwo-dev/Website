# VeTwo Component Audit (Blueprint Design System)

Status: initial inventory, 2026-10-30. Source: actual imports/usages in app/ and components/.

## Inventory

| Component | Source | Usage | Status | Notes |
|---|---|---|---|---|
| Header | components/header.tsx | layout | Keep | sticky, skip link, nav roll |
| Footer | components/footer.tsx | layout | Keep | |
| CommandPalette | components/command-palette.tsx | layout | Keep | ⌘K dialog |
| Button | components/ui (Button) | pages | Keep | variants |
| SectionHead | components/ui | pages | Refine | numbered headers |
| WorkRow | components/ui | home | Keep | |
| ProcessStep | components/ui | home | Keep | |
| Plate | components/ui | home | Keep | |
| MetaRow | components/ui | home/about/services | Keep | |
| PageIntro | components/ui | services/about/blog | Keep | |
| CtaBand | components/ui | services/about/blog | Keep | |
| Statement | components/statement.tsx | home/about/services | Refine | outline-to-fill |
| Reveal | components/reveal.tsx | pages | Keep | IntersectionObserver |
| MediaSlot | components/media-slot.tsx | home | Keep | |
| HeroChart | components/hero-chart.tsx | home | Keep | SVG |
| HeroMotion | components/hero-motion.tsx | home | Keep | GSAP choreography |
| VeTwoCircuitBackground | components/Logo/src | home | Refine | hydration fixed |
| ArticleBody | components/article-body.tsx | blog/[slug] | Keep | |

## Pages

| Route | Status | Notes |
|---|---|---|
| /en, /ar | Refine | hero, statement, sections |
| /en/services, /ar/services | Refine | numbered layers |
| /en/about, /ar/about | Refine | positions grid |
| /en/blog, /ar/blog | Keep | article list |
| /en/blog/[slug], /ar/blog/[slug] | Keep | article body |

## Blueprint primitives (planned, not yet implemented)

BlueprintGrid, BlueprintSection, BlueprintLabel, BlueprintMeta, BlueprintDimension, BlueprintGuide, BlueprintCoordinate, BlueprintBorder, BlueprintAnnotation, BlueprintInspector — to be introduced only when justified by evidence. Current grid is Tailwind container-content; no separate primitive yet.

## Inspector

Not implemented. Proposed Alt+G / Option+G toggle with fixed overlay, pointer-events none, ResizeObserver/MutationObserver, getBoundingClientRect measurements. Production-gated via env flag. Deferred pending evidence of need.
