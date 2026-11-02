# Pier Gorelli reference — screenshot manifest

Reference: <https://piergorelli.com/>  
Captured: 2026-10-21 (UTC) · Playwright 1.64.1 + Chromium (headless)  
Library: `screenshots/` · machine-readable index: `manifest.json`  
Viewports: desktop 1440×900 · tablet 768×1024 · mobile 390×844

States were produced by scrolling, hovering, keyboard (Ctrl+K), theme emulation, and `prefers-reduced-motion` emulation. Each row links a capture to the design principle it evidences. Full-page captures are tall; use the section captures for composition detail.

## Index

- Home: 26 captures
- About: 10 captures
- Services: 13 captures
- Blog index: 10 captures
- **Total: 59**

## Principles referenced

- **Editorial hierarchy** — Oversized display vs constrained body; 2-3x jump between roles.
- **Container & grid** — Gutter-scaled container, 12/4-column alignment, hairline edges.
- **Section rhythm** — Generous, consistent vertical spacing (88-158px).
- **Numbered sections** — Mono [0N] index + label as a structural marker.
- **Mono metadata** — Fixed 11.52px uppercase technical labels.
- **Negative space** — Narrow measures offset inside wide columns.
- **Hairline rules** — Alpha-ink 1px rules instead of boxes/shadows.
- **Blueprint graphics** — Drawn diagrams, grid paper, dimension labels.
- **Outline/fill type** — Stroke-only text layered with solid text.
- **Motion system** — 0.4/0.8/1.2s, cubic-bezier(.76,0,.24,1).
- **Interaction states** — Label roll, focus ring, command palette.
- **Responsive behaviour** — 4-col mobile, reduced spacing, menu->palette.
- **Theme system** — Light/dark via CSS variables, single accent.
- **Accessibility** — Visible focus, reduced-motion branch, keyboard paths.

## Home

| Screenshot | Viewport | State | Principles | Notes / limitation |
| --- | --- | --- | --- | --- |
| [`home-desktop-1440-button-hover.png`](screenshots/home-desktop-1440-button-hover.png) | 1440×900 | button-hover | Editorial hierarchy, Container & grid, Interaction states | Settled hover state; transition frames not captured. |
| [`home-desktop-1440-command-palette.png`](screenshots/home-desktop-1440-command-palette.png) | 1440×900 | command-palette | Editorial hierarchy, Container & grid, Interaction states, Accessibility | Open-state only; open/close transition timing not measured. |
| [`home-desktop-1440-dark.png`](screenshots/home-desktop-1440-dark.png) | 1440×900 | dark (dark) | Editorial hierarchy, Container & grid, Theme system | Default accent only; the accent-switcher alternatives were not captured. |
| [`home-desktop-1440-footer.png`](screenshots/home-desktop-1440-footer.png) | 1440×900 | footer | Editorial hierarchy, Container & grid | — |
| [`home-desktop-1440-full.png`](screenshots/home-desktop-1440-full.png) | 1440×900 | full | Editorial hierarchy, Container & grid, Section rhythm, Blueprint graphics | Runtime-rendered work media plate appears blank in still captures. |
| [`home-desktop-1440-header-scrolled.png`](screenshots/home-desktop-1440-header-scrolled.png) | 1440×900 | header-scrolled | Editorial hierarchy, Container & grid, Interaction states | — |
| [`home-desktop-1440-hero-loaded.png`](screenshots/home-desktop-1440-hero-loaded.png) | 1440×900 | hero-loaded | Editorial hierarchy, Container & grid, Section rhythm, Blueprint graphics | Work media plate may be blank where present (runtime rendering). |
| [`home-desktop-1440-initial.png`](screenshots/home-desktop-1440-initial.png) | 1440×900 | initial | Editorial hierarchy, Container & grid, Blueprint graphics | Sampled ~0.9s after navigation; preloader timing not frame-accurate. |
| [`home-desktop-1440-menu-open.png`](screenshots/home-desktop-1440-menu-open.png) | 1440×900 | menu-open | Editorial hierarchy, Container & grid, Interaction states, Accessibility | — |
| [`home-desktop-1440-reduced-motion.png`](screenshots/home-desktop-1440-reduced-motion.png) | 1440×900 | reduced-motion | Editorial hierarchy, Container & grid, Theme system, Accessibility, Motion system | Emulated media query in Chromium, not a physical device. |
| [`home-desktop-1440-section-blog.png`](screenshots/home-desktop-1440-section-blog.png) | 1440×900 | section-blog | Editorial hierarchy, Container & grid, Section rhythm, Hairline rules, Mono metadata, Negative space | — |
| [`home-desktop-1440-section-cta.png`](screenshots/home-desktop-1440-section-cta.png) | 1440×900 | section-cta | Editorial hierarchy, Container & grid, Section rhythm, Hairline rules, Mono metadata, Negative space | — |
| [`home-desktop-1440-section-manifesto.png`](screenshots/home-desktop-1440-section-manifesto.png) | 1440×900 | section-manifesto | Editorial hierarchy, Container & grid, Section rhythm, Hairline rules, Mono metadata, Negative space, Outline/fill type, Motion system | Scroll-fill curve unverified; snapshot of one scroll position. |
| [`home-desktop-1440-section-process.png`](screenshots/home-desktop-1440-section-process.png) | 1440×900 | section-process | Editorial hierarchy, Container & grid, Section rhythm, Hairline rules, Mono metadata, Negative space | — |
| [`home-desktop-1440-section-services.png`](screenshots/home-desktop-1440-section-services.png) | 1440×900 | section-services | Editorial hierarchy, Container & grid, Section rhythm, Hairline rules, Mono metadata, Negative space | — |
| [`home-desktop-1440-section-work.png`](screenshots/home-desktop-1440-section-work.png) | 1440×900 | section-work | Editorial hierarchy, Container & grid, Section rhythm, Hairline rules, Mono metadata, Negative space, Numbered sections | — |
| [`home-desktop-1440-work-card-hover.png`](screenshots/home-desktop-1440-work-card-hover.png) | 1440×900 | work-card-hover | Editorial hierarchy, Container & grid, Interaction states | Settled hover state; transition frames not captured. |
| [`home-mobile-390-hero-loaded.png`](screenshots/home-mobile-390-hero-loaded.png) | 390×844 | hero-loaded | Editorial hierarchy, Container & grid, Section rhythm, Blueprint graphics | Work media plate may be blank where present (runtime rendering). |
| [`home-mobile-390-menu-open.png`](screenshots/home-mobile-390-menu-open.png) | 390×844 | menu-open | Editorial hierarchy, Container & grid, Interaction states, Accessibility | — |
| [`home-mobile-390-scroll1.png`](screenshots/home-mobile-390-scroll1.png) | 390×844 | scroll1 | Editorial hierarchy, Container & grid, Section rhythm | Work media plate may be blank where present (runtime rendering). |
| [`home-mobile-390-scroll2.png`](screenshots/home-mobile-390-scroll2.png) | 390×844 | scroll2 | Editorial hierarchy, Container & grid, Section rhythm, Negative space | Work media plate may be blank where present (runtime rendering). |
| [`home-mobile-390-top.png`](screenshots/home-mobile-390-top.png) | 390×844 | top | Editorial hierarchy, Container & grid, Section rhythm, Blueprint graphics | Work media plate may be blank where present (runtime rendering). |
| [`home-tablet-768-hero-loaded.png`](screenshots/home-tablet-768-hero-loaded.png) | 768×1024 | hero-loaded | Editorial hierarchy, Container & grid, Section rhythm, Blueprint graphics | Work media plate may be blank where present (runtime rendering). |
| [`home-tablet-768-scroll1.png`](screenshots/home-tablet-768-scroll1.png) | 768×1024 | scroll1 | Editorial hierarchy, Container & grid, Section rhythm | Work media plate may be blank where present (runtime rendering). |
| [`home-tablet-768-scroll2.png`](screenshots/home-tablet-768-scroll2.png) | 768×1024 | scroll2 | Editorial hierarchy, Container & grid, Section rhythm, Negative space | Work media plate may be blank where present (runtime rendering). |
| [`home-tablet-768-top.png`](screenshots/home-tablet-768-top.png) | 768×1024 | top | Editorial hierarchy, Container & grid, Section rhythm, Blueprint graphics | Work media plate may be blank where present (runtime rendering). |

## About

| Screenshot | Viewport | State | Principles | Notes / limitation |
| --- | --- | --- | --- | --- |
| [`about-desktop-1440-full.png`](screenshots/about-desktop-1440-full.png) | 1440×900 | full | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`about-desktop-1440-initial.png`](screenshots/about-desktop-1440-initial.png) | 1440×900 | initial | Editorial hierarchy, Container & grid | Sampled ~0.9s after navigation; preloader timing not frame-accurate. |
| [`about-desktop-1440-timeline.png`](screenshots/about-desktop-1440-timeline.png) | 1440×900 | timeline | Editorial hierarchy, Container & grid, Section rhythm, Hairline rules, Mono metadata, Negative space | — |
| [`about-desktop-1440-writing.png`](screenshots/about-desktop-1440-writing.png) | 1440×900 | writing | Editorial hierarchy, Container & grid, Section rhythm, Hairline rules, Mono metadata, Negative space | — |
| [`about-mobile-390-scroll1.png`](screenshots/about-mobile-390-scroll1.png) | 390×844 | scroll1 | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`about-mobile-390-scroll2.png`](screenshots/about-mobile-390-scroll2.png) | 390×844 | scroll2 | Editorial hierarchy, Container & grid, Section rhythm, Negative space | — |
| [`about-mobile-390-top.png`](screenshots/about-mobile-390-top.png) | 390×844 | top | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`about-tablet-768-scroll1.png`](screenshots/about-tablet-768-scroll1.png) | 768×1024 | scroll1 | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`about-tablet-768-scroll2.png`](screenshots/about-tablet-768-scroll2.png) | 768×1024 | scroll2 | Editorial hierarchy, Container & grid, Section rhythm, Negative space | — |
| [`about-tablet-768-top.png`](screenshots/about-tablet-768-top.png) | 768×1024 | top | Editorial hierarchy, Container & grid, Section rhythm | — |

## Services

| Screenshot | Viewport | State | Principles | Notes / limitation |
| --- | --- | --- | --- | --- |
| [`services-desktop-1440-extra.png`](screenshots/services-desktop-1440-extra.png) | 1440×900 | extra | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`services-desktop-1440-full.png`](screenshots/services-desktop-1440-full.png) | 1440×900 | full | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`services-desktop-1440-hero-loaded.png`](screenshots/services-desktop-1440-hero-loaded.png) | 1440×900 | hero-loaded | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`services-desktop-1440-initial.png`](screenshots/services-desktop-1440-initial.png) | 1440×900 | initial | Editorial hierarchy, Container & grid | Sampled ~0.9s after navigation; preloader timing not frame-accurate. |
| [`services-desktop-1440-sheet-ai-agencies.png`](screenshots/services-desktop-1440-sheet-ai-agencies.png) | 1440×900 | sheet-ai-agencies | Editorial hierarchy, Container & grid, Section rhythm, Blueprint graphics | — |
| [`services-desktop-1440-sheet-ai-products.png`](screenshots/services-desktop-1440-sheet-ai-products.png) | 1440×900 | sheet-ai-products | Editorial hierarchy, Container & grid, Section rhythm, Blueprint graphics | — |
| [`services-desktop-1440-sheet-web.png`](screenshots/services-desktop-1440-sheet-web.png) | 1440×900 | sheet-web | Editorial hierarchy, Container & grid, Section rhythm, Blueprint graphics | — |
| [`services-mobile-390-scroll1.png`](screenshots/services-mobile-390-scroll1.png) | 390×844 | scroll1 | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`services-mobile-390-scroll2.png`](screenshots/services-mobile-390-scroll2.png) | 390×844 | scroll2 | Editorial hierarchy, Container & grid, Section rhythm, Negative space | — |
| [`services-mobile-390-top.png`](screenshots/services-mobile-390-top.png) | 390×844 | top | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`services-tablet-768-scroll1.png`](screenshots/services-tablet-768-scroll1.png) | 768×1024 | scroll1 | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`services-tablet-768-scroll2.png`](screenshots/services-tablet-768-scroll2.png) | 768×1024 | scroll2 | Editorial hierarchy, Container & grid, Section rhythm, Negative space | — |
| [`services-tablet-768-top.png`](screenshots/services-tablet-768-top.png) | 768×1024 | top | Editorial hierarchy, Container & grid, Section rhythm | — |

## Blog index

| Screenshot | Viewport | State | Principles | Notes / limitation |
| --- | --- | --- | --- | --- |
| [`blog-desktop-1440-categories.png`](screenshots/blog-desktop-1440-categories.png) | 1440×900 | categories | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`blog-desktop-1440-full.png`](screenshots/blog-desktop-1440-full.png) | 1440×900 | full | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`blog-desktop-1440-initial.png`](screenshots/blog-desktop-1440-initial.png) | 1440×900 | initial | Editorial hierarchy, Container & grid | Sampled ~0.9s after navigation; preloader timing not frame-accurate. |
| [`blog-desktop-1440-listing.png`](screenshots/blog-desktop-1440-listing.png) | 1440×900 | listing | Editorial hierarchy, Container & grid, Section rhythm, Hairline rules, Mono metadata, Negative space | — |
| [`blog-mobile-390-scroll1.png`](screenshots/blog-mobile-390-scroll1.png) | 390×844 | scroll1 | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`blog-mobile-390-scroll2.png`](screenshots/blog-mobile-390-scroll2.png) | 390×844 | scroll2 | Editorial hierarchy, Container & grid, Section rhythm, Negative space | — |
| [`blog-mobile-390-top.png`](screenshots/blog-mobile-390-top.png) | 390×844 | top | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`blog-tablet-768-scroll1.png`](screenshots/blog-tablet-768-scroll1.png) | 768×1024 | scroll1 | Editorial hierarchy, Container & grid, Section rhythm | — |
| [`blog-tablet-768-scroll2.png`](screenshots/blog-tablet-768-scroll2.png) | 768×1024 | scroll2 | Editorial hierarchy, Container & grid, Section rhythm, Negative space | — |
| [`blog-tablet-768-top.png`](screenshots/blog-tablet-768-top.png) | 768×1024 | top | Editorial hierarchy, Container & grid, Section rhythm | — |

## Global limitations

- Runtime-rendered work media renders blank in still captures (no img/video/canvas in DOM on home).
- Hover and open states are settled snapshots, not transition recordings.
- Preloader timing sampled at ~150ms resolution.
- Only the default accent colour was captured.
- Four pages plus one article; Firefox/Safari and physical devices not tested.

Do not overwrite these files. Add dated captures alongside and extend this manifest. Interpretation rules live in [`design-system.md`](design-system.md).
