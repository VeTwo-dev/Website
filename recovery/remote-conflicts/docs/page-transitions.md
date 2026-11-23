# Page Transitions — Architecture

**Status:** production, 2026-10-31 · `next-transition-router@0.2.11` · one unified component

## What it is

`components/page-transition.tsx` is the **single** enter/exit transition
component for the whole site. It owns orchestration, exit animation, the
router handoff, enter animation, timing, GSAP timeline lifecycle, cleanup and
reduced-motion behavior. There are no page-local transition wrappers; do not
add one.

## Library integration (verified against the installed API)

`next-transition-router@0.2.11` (peer `next >= 14`, runs on the installed
Next.js 16.4.3) provides:

- `TransitionRouter({children, leave, enter, auto})` — `auto: true` installs
  a document-level delegated click handler on every `a[href]`; same-origin
  navigations are intercepted (modified/middle/new-tab/download/external
  clicks pass through untouched). Any element can opt out with
  `data-transition-ignore`.
- `leave: TransitionCallback` — `(next, from?, to?) => Promise<void>`; the
  exit animation runs, and only when it completes is `next()` called, which
  is the moment the router actually swaps the page.
- `enter: TransitionCallback` — called after the new page materialized
  (stage flips to `"entering"` when the router path name changed); its
  `next()` resolves the stage back to `"none"`.
- Built-in skips: hash-only links (`href.startsWith("#")`), same
  pathname+search+hash, and the `back` method — meaning **the router itself
  runs without a transition** for browser back/forward and in-page anchors,
  exactly the behavior we want preserved.
- Navigation while `stage === "leaving"` is ignored (no queue, no overlap).

`useTransitionRouter`/`Link` from the library are intentionally **not** used:
the delegated `auto` mode already covers this app, since all navigation is
plain `<a>`/`next/link` anchors. External links and custom-protocol links
fall through by origin check.

## Mount point

`app/[locale]/layout.tsx` — `<SmoothScrollProvider> → <PageTransition>` pair:

```tsx
<body>
  <SmoothScrollProvider>
    <Header locale={locale} />
    <main id="content"><PageTransition>{children}</PageTransition></main>
    <Footer locale={locale} />
    <CommandPalette locale={locale} items={paletteItems(locale)} />
  </SmoothScrollProvider>
</body>
```

The header/footer mount **outside** the transitioned page element, so they
never remount or re-animate themselves on navigation. Locale switches are
full-layout remounts: both providers initialize cleanly — no duplicate
instances, no stale listeners.

## Visual concept — "controlled dark-surface reveal"

One idea, stated in the design language (tokens only, no raw colors):

1. **Exit (0.24 s):** the page content yields slightly downward (opacity→0,
   y −10) while a full-viewport surface in `--color-background` rises to
   cover. A 1px `--color-accent` hairline draws across it from
   inline-start.
2. **Swap:** the router replaces the page underneath the opaque surface.
   Nothing of the old page remains visible or interactive (its container is
   animation-faded and the surface blocks pointers).
3. **Enter (0.6 s):** the hairline wipes away into the reading direction
   (the origin classes mirror under `dir="rtl"`), the new content floats up
   from beneath (opacity 0→1, y 14→0), the surface then dissolves to
   expose the settled page.

Total interaction budget < 1 s; navigation remains responsive. The overlay is
`aria-hidden`, not focusable, and only intercepts pointers during the
animation (`pointer-events` resets on completion), so keyboard navigation and
screen readers are untouched. No decorative movement runs under reduced
motion (below).

## Timeline architecture

Internal helpers `createExitTimeline()` / `createEnterTimeline()` / `runTransition()`:

- GSAP is imported at the top of the module (client-only; static import
  matches the existing `page-transition` convention and primes the bundle
  that `hero-motion` dynamically reuses).
- Every timeline start kills the previous one
  (`timelineRef.current?.kill()` + `gsap.killTweensOf(page, overlay, line)`)
  — interrupted transitions and rapid successive navigations never overlap.
- Scoped element refs only; no global selectors. The animated elements are
  the transition wrapper (`data-ref` = `pageRef`), the overlay
  (`data-transition-overlay`) and the hairline (`data-transition-line`).
- Unmount cleanup (Strict Mode safe) kills the active timeline, kills tween
  props, clears the inline styles GSAP left behind, and re-opens smooth
  scrolling if it was mid-stop (`scroll.start()`).

## Lenis / ScrollTrigger integration

- `scroll.stop()` on exit start holds user wheel/touch so nothing can fire
  halfway through the swap; `scroll.start()` on enter completion resumes.
  This reuses the global provider API — the Lenis instance itself is never
  destroyed or recreated by the transition system.
- Scroll position: Next.js performs its scroll reset (top for pushes; page
  target for hash URLs; restoration for back/forward) **while the surface
  still covers the outgoing content**, so no visible scroll jump occurs.
  Lenis syncs to the native jump through its own native-scroll handler. The
  provider also sets `stopInertiaOnNavigate: true`, which kills residual
  momentum the moment a cross-route link is clicked.
- `ScrollTrigger.refresh()` + `lenis.resize()` run when the incoming page is
  mounted and measurable (enter completion), before reveal finishes —
  route-specific timelines that initialize on mount (e.g. the hero
  entrance) settle underneath the surface rather than afterwards.

## Existing animation interplay (audit results)

- **Hero entrance** (`hero-motion.tsx`, dynamic `import("gsap")`): runs on
  the new page's mount underneath the covering surface; unchanged, no
  ownership conflict (different elements, different timelines).
- **`Reveal` (IntersectionObserver)** / **`Statement` fill**: window-level
  listeners; unaffected by the transition (no transform contention).
- **`StrokeText`** ScrollTriggers: created inside their own component sync;
  the transition only re-c positions via `ScrollTrigger.refresh()` — no
  duplicate creation.
- **Scroll progress bar**: writes `--scroll-progress` from window scroll —
  operates as before (the transition never writes that var).
- **Command palette**: opens/closes as a modal over any stage; its internal
  scroll container is `data-lenis-prevent`.

## Reduced motion

At invocation time the component checks
`matchMedia("(prefers-reduced-motion: reduce)")` live: exit/enter both
resolve instantly (`next()` without animation; the overlay never mounts).
Navigation timing stays what it is natively. The global Lenis provider
additionally declines to initialize at all when the preference is on at
mount, and Lenis' own `respectReducedMotion` handles mid-session changes.

## Files created/modified

- `components/page-transition.tsx` — rewritten (was an enter-only fade).
- `app/[locale]/layout.tsx` — provider + transition mounted (unchanged
  markup order otherwise).
- `node_modules` — `next-transition-router@0.2.11` added (bundler `delegate-it`).

## Testing entry points

- `bun run qa:browser` (`scripts/puppeteer-qa.mjs`) — route/view matrices;
  use `--palette`/`--menu` for overlay states, `--reduced-motion` for the
  RM gate, `--full` for reveal sweeps.
- Manual QA scripts below in `docs/design-system.md` entries for
  transition-specific evidence (exit/overlay/enter captures, back/forward,
  rapid navigation), which are appended when this system changes.
