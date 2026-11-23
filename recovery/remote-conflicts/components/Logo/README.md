# VeTwoCircuitBackground

Client-side React component that renders an animated circuit background derived from the official VeTwo V2 logo (`vetwo-v2-horse.svg`).
Requires React 18+ (tested with 19). No other runtime dependencies; no animation library is used (CSS + SVG only).

```tsx
import { VeTwoCircuitBackground } from '@/components/vetwo-circuit-background'

<section className="relative isolate overflow-hidden bg-[#0A0F0D]">
  <VeTwoCircuitBackground className="absolute inset-0 -z-10" fit="cover" position="right" />
  <div className="relative z-10">…hero content…</div>
</section>
```
The component is `pointer-events: none`, `aria-hidden`, and contains no focusable elements. It fills its box (`width/height` default `100%`); the consumer decides positioning.

## How the geometry was made
The supplied SVG is an auto-traced **filled** vector (147 paths, no strokes), so its traces cannot be stroke-animated directly.
`scripts/extract-geometry.py` rasterises the trace shapes, removes thick filled regions, takes pad centres from a distance transform, skeletonises the rest and simplifies it into centreline polylines (66 traces, 52 pads), emitted into `src/geometry/vetwoV2.ts` (frozen, deterministic, viewBox 2048). The official silhouette (path 0) is reused verbatim for the silhouette layer. Original assets are untouched.
Limitations: the "2" foot block and mane have no traces in the source logo; centrelines follow the logo's own angles (not forced to 45/90); a few short skeleton fragments near the horse head are imperfect.

## Props (all implemented; unlisted spec props are intentionally omitted)
Appearance: `color` `secondaryColor` `glowColor` `backgroundColor` `opacity` `lineWidth` `glowIntensity` `contrast` `blendMode` `className` `style`
Geometry: `geometry` (`logo | dense | minimal | perimeter | ambient`) `density` `nodeDensity` `branchDensity` `showNodes` `showGlow` `showLogoSilhouette` `showSecondaryTraces`
Animation: `animated` `animationSpeed` `pulseSpeed` `pulseDensity` `pulseSize` `pulseIntensity` `drawIn` `drawInDuration` `glowAnimation` `loop` `paused` `reducedMotion` (`auto | always | never`) `restartKey` `onAnimationComplete` + ref handle `restart()`
Layout: `width` `height` `fit` (`contain | cover`) `position` `interactive` `pointerEffects` (`none | highlight`) `seed`

Omitted on purpose: `traceSpacing`, `detailLevel` (the extracted geometry has a single resolution, so they would be no-ops), and `preserveAspectRatio` (fully expressed by `fit` + `position`).
Presets set defaults for density/branch/node/pulse/silhouette/opacity; any explicit prop wins. Density thins deterministically by length rank (traces) or a spatially even order (pads).
Reduced motion: `auto` uses the CSS media query (no JS, no hydration mismatch); the base style is the finished composition, so nothing is ever half-drawn. `always` renders no pulses at all.

## Performance notes (what is and isn't verified)
Design intent: no per-frame React state; pulses are `<circle>`s moved with CSS `offset-distance` and `opacity`; glow is an extra wide low-opacity stroke (no SVG filters); `contain: paint` on the root; no blanket `will-change`.
**Not measured:** compositor promotion of `offset-distance` is browser-dependent and is unverified; draw-in (`stroke-dashoffset`) repaints SVG on the main thread but runs once. Profile before making GPU claims. Pulses are hidden where `offset-path` is unsupported.
Element counts (paths+circles, static): minimal 44, perimeter 56, ambient 55, logo 130, dense 189.
