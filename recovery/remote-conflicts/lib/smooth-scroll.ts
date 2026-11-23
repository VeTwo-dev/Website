import type { LenisOptions } from "lenis";

/**
 * Global smooth-scroll configuration (single source of truth).
 *
 * Mounted once in `app/[locale]/layout.tsx` via
 * `components/providers/smooth-scroll-provider.tsx`; components reach it through
 * `components/use-smooth-scroll.ts`.
 *
 * Every non-default value below is a deliberate, verified choice against
 * the installed `lenis` version (see docs/smooth-scroll.md) — no arbitrary
 * tuning by feel:
 *
 * - `lerp: 0.1` — Lenis' own default. Settles within ~10 frames of release:
 *   immediate input response without momentum carry-over, and never fights
 *   the user's scroll direction (target is recomputed additively per event).
 * - `smoothWheel: true` — interpolation applies to wheel/trackpad input.
 * - `syncTouch: false` — touch devices keep their native momentum scrolling.
 *   Forcing desktop-style interpolation onto touch adds latency and breaks
 *   the rubber-band expectations users already have; native wins (§8).
 * - `wheelMultiplier: 1` / `touchMultiplier: 1` — no artificial speed-up or
 *   slow-down of user gesture.
 * - `orientation: "vertical"`, `gestureOrientation: "vertical"` — only
 *   vertical smooth-scrolling is wanted; horizontal gestures (the
 *   horizontally-scrolling wide figures in `.hero-chart-scroll`) pass
 *   through natively because Lenis ignores unknown gestures.
 * - `infinite: false` — normal document flow, no looping.
 * - `autoRaf: false` — Lenis' own RAF loop is disabled; the single shared
 *   frame source is the GSAP ticker (see provider). One clock, no double
 *   RAF.
 * - `respectReducedMotion: true` — built-in runtime `prefers-reduced-motion`
 *   handling: user input scrolls 1:1 (`lerp` forced to 1) and programmatic
 *   scrolls (anchor jumps, `scrollTo`) become instant, re-evaluated live on
 *   preference change. No custom reduced-motion branch is needed here.
 * - `anchors: true` — Lenis intercepts same-path hash links and drives them
 *   through its own easing; the installed version honours each target's
 *   authored `scroll-mt-*` margin (verified in `lenis.mjs`), so telegraphed
 *   offsets stay in the markup/tokens layer, not in JS.
 * - `stopInertiaOnNavigate: true` — clicking a link that leaves the page
 *   kills residual momentum so the next route never starts scrolled by an
 *   unrelated flick.
 * - `autoToggle`, `allowNestedScroll`, `infinite` stay off: Lenis only
 *   claims window scroll; independent containers (command palette dialog,
 *   inside elements marked `data-lenis-prevent`) keep native scrolling.
 */
export const SMOOTH_SCROLL_CONFIG = {
  lerp: 0.1,
  smoothWheel: true,
  syncTouch: false,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  orientation: "vertical",
  gestureOrientation: "vertical",
  infinite: false,
  autoRaf: false,
  respectReducedMotion: true,
  anchors: true,
  stopInertiaOnNavigate: true,
} satisfies Partial<LenisOptions>;

/** A scroll snapshot delivered by the scroll API (framework-neutral). */
export type ScrollState = {
  /** Current scroll position, in px. */
  scroll: number;
  /** Maximum scrollable distance, in px. */
  limit: number;
  /** 0..1 progress through the document. */
  progress: number;
  /** Last velocity, px/frame-ish (library-reported). */
  velocity: number;
  /** Direction of the last movement: -1 (up), 1 (down), 0 (idle). */
  direction: 1 | -1 | 0;
};

/** Targets accepted by the public scroll API. */
export type ScrollTarget =
  | number
  /** "top" = 0, "bottom" = document end. */
  | "top"
  | "bottom"
  /** A CSS selector ("#projects") or a DOM element. */
  | string
  | Element;

export type ScrollToOptions = {
  /** Additive offset in px (negative pulls the target earlier). */
  offset?: number;
  /** Jump instantly instead of animating (also forced under reduced motion). */
  immediate?: boolean;
};

/**
 * Compute the absolute document Y coordinate for a target, used only when
 * Lenis is unavailable (e.g. reduced-motion fallback path or load failure).
 *
 * Runs in the browser only; the caller guards that. `scroll-margin-top`
 * is intentionally NOT resolved here — this path is a degraded fallback
 * (documented), while the Lenis path reads `scroll-margin` itself.
 */
export function resolveNativeTop(target: ScrollTarget, offset: number): number {
  if (typeof target === "number" && !Number.isFinite(target)) {
    return clampScroll(document.documentElement.scrollHeight - window.innerHeight);
  }
  if (typeof target === "number") return clampScroll(target + offset);
  if (target === "top") return clampScroll(offset);
  if (target === "bottom") return clampScroll(document.documentElement.scrollHeight - window.innerHeight);
  const element: Element | null =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!element) return clampScroll(0);
  return clampScroll(element.getBoundingClientRect().top + window.scrollY + offset);
}

function clampScroll(value: number): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(Math.max(0, value), Math.max(0, max));
}
