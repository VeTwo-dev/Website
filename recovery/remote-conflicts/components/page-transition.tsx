"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/hooks/use-smooth-scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Unified page transition (VeTwo). One component orchestrates exit and enter
 * for every route change, driven by `next-transition-router`'s lifecycle:
 *
 *   user clicks an internal link
 *     → `runExitTimeline` animates the current page out
 *     → (exit complete) the router swaps the page under the covering surface
 *     → router rerenders + pathname changes → stage "entering"
 *     → `runEnterTimeline` reveals the new page
 *     → (enter complete) overlay returns to rest, ScrollTrigger re-calibrated
 *
 * Visual concept (single idea: "controlled dark-surface reveal"):
 * the page content yields slightly downward while the token-background
 * surface rises to cover; a 1px accent hairline draws across it
 * (inline-start → inline-end, mirrored for RTL). On entry the hairline wipes
 * away into the reading direction while the new content floats up beneath,
 * the surface then dissolves to expose the settled page. Numbers/emphasis:
 * exit 0.24s, enter 0.6s — quick enough that navigation still feels instant.
 *
 * Guarantees:
 * - The overlay hides the router's own swap, so the new page can never flash
 *   (React effects run after commit, and the surface is opaque meanwhile).
 * - Lenis smooth scrolling is suspended for the duration (wheel events are
 *   held) and resumed on enter completion; the provider instance is reused,
 *   never recreated.
 * - ScrollTrigger is refreshed and Lenis dimensions are re-measured once the
 *   incoming page is mounted and measurable — route-specific timelines that
 *   run on mount (hero) settle under the surface instead of after it.
 * - Browser back/forward and hash-only links never run a transition (the
 *   library passes them to the router untouched); scroll restoration there
 *   stays fully native.
 * - Reduced motion: skip both animations entirely — the click behaves like
 *   an instant navigation (surface never appears).
 * - Rapid successive clicks are ignored by the library while `leaving`; our
 *   own timelines are killed on every exit/enter start and on unmount.
 * - The overlay is aria-hidden, not focusable, and only blocks pointer
 *   during the animation, so keyboard/assisted navigation stays intact.
 */

/** Exit + enter timings, seconds. Total interruption budget < 1s. */
export const TRANSITION_TIMES = { exit: 0.24, enter: 0.6 } as const;

export function PageTransition({ children }: { children: ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const scroll = useSmoothScroll();

  // Runs on unmount (and Strict Mode double-mount): revert all owned state.
  useEffect(() => {
    // Capture nodes now: cleanup runs long after re-renders may have swapped
    // the ref values, and the teardown must target exactly these nodes.
    const page = pageRef.current;
    const overlay = overlayRef.current;
    const line = lineRef.current;
    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf([page, overlay, line].filter(Boolean));
      gsap.set(page, { clearProps: "transform,opacity" });
      gsap.set(overlay, { clearProps: "all" });
      gsap.set(line, { clearProps: "transform" });
      // Never leave the rail stopped if we are torn down mid-transition.
      scroll.start();
    };
  }, [scroll]);

  const createExitTimeline = (complete: () => void): gsap.core.Timeline => {
    const tl = gsap.timeline({ onComplete: complete });
    timelineRef.current = tl;
    // The surface must actually intercept pointers while it covers the page
    // (the rest state is pointer-events: none via utility classes).
    gsap.set(overlayRef.current, { visibility: "visible", pointerEvents: "auto" });
    gsap.set(lineRef.current, { scaleX: 0 });
    tl.fromTo(
      overlayRef.current,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: TRANSITION_TIMES.exit * 0.75, ease: "power1.out" },
      0,
    )
      .fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: TRANSITION_TIMES.exit, ease: "power2.inOut" },
        0,
      )
      .to(
        pageRef.current,
        {
          opacity: 0,
          y: -10,
          duration: TRANSITION_TIMES.exit * 0.8,
          ease: "power1.in",
        },
        0.04,
      );
    return tl;
  };

  const createEnterTimeline = (complete: () => void): gsap.core.Timeline => {
    const tl = gsap.timeline({ onComplete: complete });
    timelineRef.current = tl;
    gsap.set(pageRef.current, { opacity: 0, y: 14 });
    tl.fromTo(
      lineRef.current,
      { scaleX: 1 },
      { scaleX: 0, duration: TRANSITION_TIMES.exit, ease: "power2.out" },
      0,
    )
      .to(
        pageRef.current,
        { opacity: 1, y: 0, duration: TRANSITION_TIMES.enter * 0.65, ease: "power2.out" },
        0.1,
      )
      .to(
        overlayRef.current,
        { autoAlpha: 0, duration: TRANSITION_TIMES.enter * 0.5, ease: "power1.in" },
        0.18,
      );
    return tl;
  };

  const runTransition = async (
    isExit: boolean,
    next: () => void,
  ): Promise<void> => {
    // Reduced motion (checked live at invocation): instant navigation, no
    // decorations, no delay. Also guards a missing container (SSR edge).
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !pageRef.current || !overlayRef.current) {
      return next();
    }

    // Never let an owned timeline overlap the next one (rapid navigation).
    timelineRef.current?.kill();
    timelineRef.current = null;
    gsap.killTweensOf([pageRef.current, overlayRef.current, lineRef.current]);

    if (isExit) {
      scroll.stop(); // hold wheel/touch while the pages swap underneath
      // Next.js performs its own scroll reset (or hash scroll) once the new
      // page mounts; it happens underneath the exited page while the
      // surface is still covering. The Lenis instance stays live and syncs
      // to the native jump via its own native-scroll handler.
      return new Promise<void>((resolve) => {
        const tl = createExitTimeline(() => {
          next();
          resolve();
        });
        timelineRef.current = tl;
      });
    }

    // ENTER: the new page is mounted (but hidden under the surface).
    gsap.set(pageRef.current, { pointerEvents: "none" });
    await new Promise<void>((resolve) => {
      const tl = createEnterTimeline(() => {
        // Re-calibrate scroll-driven animation: layout changed with the route.
        ScrollTrigger.refresh();
        scroll.getLenis()?.resize();
        resolve();
      });
      timelineRef.current = tl;
    });
    // Restore interaction only after the reveal settles.
    gsap.set(pageRef.current, { clearProps: "pointer-events" });
    gsap.set(overlayRef.current, { visibility: "hidden", pointerEvents: "none" });
    scroll.start(); // resume user scrolling (no-op when smooth-scroll inactive)
    next();
  };

  const leave = async (next: () => void): Promise<void> => {
    await runTransition(true, next);
  };

  const enter = async (next: () => void): Promise<void> => {
    await runTransition(false, next);
  };

  return (
    <>
      <TransitionRouter leave={leave} enter={enter} auto={true}>
        <div ref={pageRef}>{children}</div>
      </TransitionRouter>
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 invisible bg-background"
        data-transition-overlay=""
      >
        <span
          ref={lineRef}
          className="absolute inset-x-0 top-1/2 block h-px origin-left rtl:origin-right bg-accent"
          data-transition-line=""
        />
      </div>
    </>
  );
}
