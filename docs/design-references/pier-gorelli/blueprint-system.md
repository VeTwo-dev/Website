# VeTwo Blueprint System

Status: baseline documentation, 2026-10-30.

## Grid

- Max content width: 1280px (container-content).
- Columns: 12 desktop, 4 mobile (per existing token spec).
- Gutters: 4/8/12px scale.
- Section spacing: py-20 sm:py-24 lg:py-28 for editorial sections.
- No separate BlueprintGrid primitive yet; Tailwind utilities shared across pages.

## Inspector

Not implemented. Planned: Alt+G / Option+G toggle, fixed overlay with pointer-events none, DOM measurement via getBoundingClientRect, ResizeObserver + rAF batching, production gating via env flag.

## Animation

- GSAP approved solely for hero choreography + units-chart SVG draw (components/hero-motion.tsx).
- Reveal (IntersectionObserver) for scroll reveals.
- Statement outline-to-fill (CSS).
- Circuit background deterministic (hydration fixed).

## References

- Canonical guide: docs/design-references/pier-gorelli/design-system.md
- Component audit: docs/design-references/pier-gorelli/component-audit.md
- General design system: docs/design-system.md
