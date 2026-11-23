# Smooth Scroll (Lenis) — Architecture

**Status:** production, 2026-10-31 · `lenis@1.3.27` · one instance per application

## Where things live

| File | Role |
| --- | --- |
| `lib/smooth-scroll.ts` | Configuration single source of truth (`SMOOTH_SCROLL_CONFIG`), neutral `ScrollState`/`ScrollTarget` types, native fallback math (`resolveNativeTop`). Pure, unit-tested. |
| `components/smooth-scroll-provider.tsx` | Client `<SmoothScrollProvider>` + context + `useSmoothScroll` (core). Mounted once in `app/[locale]/layout.tsx`. |
| `components/use-smooth-scroll.ts` | Public hook, re-exports types. Consumer-facing single import. |

The **root** `app/layout.tsx` is a pass-through; `<html>/<body>` live in the
locale layout — that is the highest shared mount point, so the provider sits
inside `<body>`, wrapping `Header`, `main`, `Footer`, and `CommandPalette`.
Locale switches remount the layout tree and cleanly destroy/re-create the
instance; in-locale route changes keep it alive. There is **exactly one** live
Lenis instance per document (module-scoped owner; hot-reload strays are
destroyed before re-creation).

## Initialization and configuration

```ts
new Lenis({
  lerp: 0.1,               // Lenis default; fast settle, no float
  smoothWheel: true,       // wheel/trackpad interpolation
  syncTouch: false,        // native momentum on touch (mobile keeps its feel)
  wheelMultiplier: 1, touchMultiplier: 1,
  orientation: "vertical", gestureOrientation: "vertical",
  infinite: false,
  autoRaf: false,          // stepped by the GSAP ticker (see below)
  respectReducedMotion: true, // built-in live honoring of prefers-reduced-motion
  anchors: true,           // same-path hash links scroll via Lenis easing;
                           // per-target offsets come from authored scroll-mt-*
  stopInertiaOnNavigate: true, // no momentum carry-over when a link changes route
})
```

Every non-default is a deliberate, source-verified decision — see the
comment block in `lib/smooth-scroll.ts`. Do not tune by feel; re-verify with
the QA harness (`bun run qa:browser`).

## GSAP ticker integration (one frame loop)

The provider connects Lenis to GSAP exactly as the official recipe:

```ts
lenis.on("scroll", () => ScrollTrigger.update());
const tickerCallback = (time: number) => lenis.raf(time * 1000); // s → ms
gsap.ticker.add(tickerCallback);
gsap.ticker.lagSmoothing(0);
```

- One shared RAF: GSAP's ticker steps Lenis (`autoRaf: false`), no competing
  `requestAnimationFrame` loop, no double-tick.
- `ScrollTrigger.update` runs on every Lenis-driven position; Lenis scrolls
  the real window, so no `scrollerProxy` is used (a proxy would desync reads).
- `lagSmoothing(0)` prevents correction jumps after long frames.

## Public scroll API (`useSmoothScroll`)

```tsx
"use client";
import { useSmoothScroll } from "@/components/use-smooth-scroll";

const scroll = useSmoothScroll();
scroll.scrollToTop();                          // 0
scroll.scrollToBottom({ immediate: true });    // document end, instant
scroll.scrollTo("#projects", { offset: -16 }); // element/selector/number
scroll.getScrollState();                       // {scroll, limit, progress, velocity, direction} | native
scroll.start(); scroll.stop();                 // pause/resume wheel+touch smoothing
const off = scroll.onScroll((state) => console.log(state.progress)); // snapshot events (frame-scheduled)
scroll.getLenis();                              // live instance or null
```

Fallback semantics (same signature, no Lenis — reduced motion at mount or
module load failure): `scrollTo` does an instant native jump (minimized,
documented), `getScrollState`/`notifyScrollState` carry native values, and
`start`/`stop` are no-ops. Subscription callbacks receive normalized
`ScrollState`, never the Lenis instance, so consumer code is rail-agnostic.

Reduced motion after initialization is handled by Lenis itself
(`respectReducedMotion`): the next input scrolls 1:1 and programmatic scrolls
become instant, re-checked live per frame — no React-state bookkeeping.

## Excluding independent scroll containers

Any element that must keep its own native scrolling gets
`data-lenis-prevent` (the installed version honors it automatically; variants
`-wheel`/`-touch`/`-vertical`/`-horizontal` exist). Applied today:

- `components/command-palette.tsx` — the `<dialog class="palette-dialog">`
  (its results list scrolls inside the modal).

Add it to anything with `overflow-y-auto`/inner scrollers
(`ScrollStack`/`ScrollExpand`-style widgets), and prefer detection via the
QA harness over assuming.

## Lifecycle guarantees

- Cleanup reverses in strict order: GSAP ticker callback removed →
  `lagSmoothing` restored → scroll subscription torn down → `lenis.destroy()` →
  module owner cleared. A frame can never step a destroyed instance.
- Strict Mode double-mount safe: the async import is guarded by a
  `cancelled` flag; unmount before imports resolve leaves nothing behind.
- Scroll notifications are frame-scheduled outside React state; the context
  value is instance-stable (scrolling never re-renders the tree).

## Adding future scroll-driven animations

1. Prefer existing infra: `Reveal` (IO), `Statement` (scroll listener), or
   ScrollTrigger for scrub/pin once the provider is mounted. With Lenis
   active, ScrollTrigger positions are exact (the rail drives compute only
   on the native window position).
2. When content length/layout can change (lazy mounts, route swaps), call
   `ScrollTrigger.refresh()` and `lenis.resize()` after the change — the
   page transition component already does this on navigation.
3. GSAP usage rules live in `docs/design-system.md` (hero choreography is
   the sanctioned core usage).

Full verification evidence (QA runs, screenshots) is appended to
`docs/design-system.md` for each pass that changes this system.
