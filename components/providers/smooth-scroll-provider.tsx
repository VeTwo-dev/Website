"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { SMOOTH_SCROLL_CONFIG, resolveNativeTop, type ScrollState, type ScrollTarget, type ScrollToOptions } from "@/lib/smooth-scroll";

/**
 * Global Lenis smooth-scroll provider.
 *
 * Mounted exactly once in `app/[locale]/layout.tsx` (where <html>/<body>
 * live; the root layout is a pass-through). Locale switches remount the
 * layout, which cleanly destroys and re-creates the instance; in-locale
 * route changes keep the instance alive so scrolling never tears mid-page.
 *
 * Frame architecture (the load-bearing part of this file):
 * - Exactly ONE animation clock: `gsap.ticker`. Lenis is stepped from the
 *   ticker callback (`gsap` time is seconds, Lenis' `raf` wants
 *   milliseconds, hence `time * 1000`) and Lenis' own RAF loop is off
 *   (`autoRaf: false`), so no competing `requestAnimationFrame` exists.
 * - `lenis.on("scroll", ScrollTrigger.update)` lets ScrollTrigger observe
 *   every Lenis-driven position. Lenis scrolls the real window (no
 *   transform proxy), so ScrollTrigger reads the native scroll position —
 *   `scrollerProxy` is unnecessary and would only desync reads.
 * - `gsap.ticker.lagSmoothing(0)` per the official Lenis ⨯ GSAP recipe:
 *   without it the ticker injects correction jumps after a long frame,
 *   which would show up as sudden scroll teleporting.
 *
 * Reduced motion: when `prefers-reduced-motion: reduce` is active at mount,
 * Lenis is NOT initialized at all — wheel/touch keep fully native behavior,
 * anchor jumps stay instant, and the scroll API below degrades to native
 * scrolling automatically. (Lenis' built-in `respectReducedMotion` would
 * also be honored if the preference flips after init: the installed
 * version live-rechecks the media query and forces `lerp = 1` /
 * `immediate` per frame, so no runtime listener is needed here.)
 *
 * Lifecycle guarantees:
 * - Strict Mode double-mount is safe: cleanup fully reverses init, and the
 *   async import is guarded by a `cancelled` flag so an unmount before the
 *   imports resolve cannot leak an orphan instance.
 * - A module-scoped owner reap kills any stray instance left by a hot
 *   reload before a new one is created — two live instances are impossible.
 * - Cleanup order is deliberate: ticker callback removed BEFORE
 *   `lenis.destroy()`, so no tick can step a destroyed instance.
 * - High-frequency scroll notifications are delivered outside React state
 *   (subscription callbacks only); the context value instance-stable, so
 *   scrolling never re-renders the provider tree.
 */

export type ScrollApi = {
  /** Whether a live Lenis instance exists (false = native fallback active). */
  readonly enabled: boolean;
  /** The live instance, or null (SSR, reduced motion, module load failure). */
  getLenis: () => Lenis | null;
  /** Scroll to a target (see ScrollTarget). Falls back to native without Lenis. */
  scrollTo: (target: ScrollTarget, options?: ScrollToOptions) => void;
  scrollToTop: (options?: ScrollToOptions) => void;
  scrollToBottom: (options?: ScrollToOptions) => void;
  /** Resume Lenis smoothing (user input only; native/programmatic unaffected). */
  start: () => void;
  /** Stop Lenis smoothing (wheel/touch are held; dialogs should not need this). */
  stop: () => void;
  /** Read the current scroll state; null on the server. */
  getScrollState: () => ScrollState | null;
  /**
   * Subscribe to scroll updates. Receives a normalized `ScrollState` (not
   * the Lenis instance), so consumer code is identical whether the smooth
   * rail is active or degraded to native scrolling. Returns an unsubscribe
   * function. Safe to call before initialization.
   */
  onScroll: (listener: (state: ScrollState) => void) => () => void;
};

type Lenis = import("lenis").default;

const ScrollContext = createContext<ScrollApi | null>(null);

/* ------------------------------------------------------------------ */
/* Module-scoped singleton state. One Lenis instance per document,      */
/* defined at module level because hot reloads / remounts must never    */
/* fork two live instances, and because the scroll API reads it.        */
/* ------------------------------------------------------------------ */

let lenisInstance: Lenis | null = null;

const subscribers = new Set<(state: ScrollState) => void>();
let dispatchFrame = 0;

/** Build the framework-neutral snapshot from live (library or native) state. */
function snapshot(): ScrollState {
  if (typeof window === "undefined") {
    return { scroll: 0, limit: 0, progress: 0, velocity: 0, direction: 0 };
  }
  if (lenisInstance) {
    const lenis = lenisInstance;
    const limit = lenis.limit;
    const scroll = lenis.scroll;
    return {
      scroll,
      limit,
      progress: limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0,
      velocity: lenis.velocity,
      direction: lenis.direction,
    };
  }
  const max = (document.documentElement?.scrollHeight ?? window.innerHeight) - window.innerHeight;
  const scroll = window.scrollY;
  return { scroll, limit: Math.max(0, max), progress: max > 0 ? Math.min(1, Math.max(0, scroll / max)) : 0, velocity: 0, direction: 0 };
}

function dispatch(): void {
  const state = snapshot();
  for (const listener of subscribers) listener(state);
}

/** rAF-scheduled dispatch: at most one notification per subscriber per frame. */
function scheduleDispatch(): void {
  if (dispatchFrame) return;
  dispatchFrame = requestAnimationFrame(() => {
    dispatchFrame = 0;
    dispatch();
  });
}

function destroyStrayLenis(): void {
  lenisInstance?.destroy();
  lenisInstance = null;
}

/** The public API. Callable before initialization; degrades to native. */
const scrollApi: ScrollApi = {
  get enabled() {
    return lenisInstance !== null;
  },
  getLenis: () => lenisInstance,
  scrollTo(target, options = {}) {
    const lenis = lenisInstance;
    const offset = options.offset ?? 0;
    if (lenis) {
      // Lenis natively handles numbers, elements, selectors, and the
      // "top"/"bottom" literals (verified against the installed version).
      lenis.scrollTo(target as number | string | Element, { offset, immediate: options.immediate ?? false });
      return;
    }
    if (typeof window === "undefined") return;
    window.scrollTo({ top: resolveNativeTop(target, offset), behavior: "auto" });
  },
  scrollToTop(options) {
    scrollApi.scrollTo(0, options);
  },
  scrollToBottom(options) {
    scrollApi.scrollTo(Number.POSITIVE_INFINITY, options);
  },
  start: () => lenisInstance?.start(),
  stop: () => lenisInstance?.stop(),
  getScrollState: () => snapshot(),
  onScroll(listener) {
    subscribers.add(listener);
    listener(snapshot()); // immediate current state on subscribe
    return () => {
      subscribers.delete(listener);
    };
  },
};

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reduced motion: keep everything native. No Lenis, no wheel claiming,
    // instant anchor/value scrolls through the API's native fallback.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Native scroll notifications still feed subscribed consumers.
      window.addEventListener("scroll", scheduleDispatch, { passive: true });
      return () => {
        window.removeEventListener("scroll", scheduleDispatch);
      };
    }

    let cancelled = false;
    let teardown: () => void = () => {};

    void (async () => {
      try {
        const [{ default: Lenis }, gsapModule, scrollTriggerModule] = await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;

        // Reap a stray instance from a hot reload before creating ours.
        destroyStrayLenis();

        const gsap = gsapModule.gsap;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis(SMOOTH_SCROLL_CONFIG);
        lenisInstance = lenis;

        // ScrollTrigger follows every Lenis-driven position (official sync).
        const updateScrollTrigger = () => ScrollTrigger.update();
        lenis.on("scroll", updateScrollTrigger);

        // Lenis is stepped by the GSAP ticker: one shared frame source.
        const tickerCallback = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tickerCallback);
        gsap.ticker.lagSmoothing(0);

        if (cancelled) {
          // Unmounted while initializing: reverse in reverse-dependency order.
          gsap.ticker.remove(tickerCallback);
          gsap.ticker.lagSmoothing(5000, 33);
          lenis.destroy();
          lenisInstance = null;
          return;
        }

        window.addEventListener("scroll", scheduleDispatch, { passive: true });

        teardown = () => {
          // Ticker callback first: no frame may step a destroyed instance.
          gsap.ticker.remove(tickerCallback);
          gsap.ticker.lagSmoothing(5000, 33); // restore GSAP default
          lenis.destroy();
          lenisInstance = null;
          window.removeEventListener("scroll", scheduleDispatch);
        };
      } catch {
        // Module load failure: the site keeps native scrolling; the scroll
        // API degrades transparently (native fallbacks above).
        window.addEventListener("scroll", scheduleDispatch, { passive: true });
        teardown = () => {
          window.removeEventListener("scroll", scheduleDispatch);
          lenisInstance = null;
        };
      }
    })();

    return () => {
      cancelled = true;
      teardown();
      teardown = () => {};
    };
    // Mount-only: the provider owns the singleton for the whole app tree.
  }, []);

  return <ScrollContext.Provider value={scrollApi}>{children}</ScrollContext.Provider>;
}

/**
 * Access the global scroll API. Throws outside the provider tree — the
 * provider is mounted by the `[locale]` layout, so this only fires for
 * components rendered outside the app shell.
 */
export function useSmoothScroll(): ScrollApi {
  const api = useContext(ScrollContext);
  if (!api) {
    throw new Error(
      "useSmoothScroll was called outside <SmoothScrollProvider> — it is mounted by app/[locale]/layout.tsx.",
    );
  }
  return api;
}
