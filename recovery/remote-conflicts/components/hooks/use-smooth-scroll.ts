"use client";

import { useSmoothScroll as useSmoothScrollCore, type ScrollApi } from "../providers/smooth-scroll-provider";

export type { ScrollApi } from "../providers/smooth-scroll-provider";
export type { ScrollState, ScrollTarget, ScrollToOptions } from "@/lib/smooth-scroll";

/**
 * Public scroll API hook.
 *
 * ```tsx
 * "use client";
 * import { useSmoothScroll } from "@/components/use-smooth-scroll";
 *
 * function BackToTop() {
 *   const scroll = useSmoothScroll();
 *   return <button onClick={() => scroll.scrollToTop()}>Top</button>;
 * }
 *
 * function SectionLinks() {
 *   const scroll = useSmoothScroll();
 *   // Element target (offset is additive onto the element's scroll-margin):
 *   const go = () => scroll.scrollTo("#projects", { offset: -16 });
 *   return <button onClick={go}>Projects</button>;
 * }
 *
 * function ScrollReadout() {
 *   const scroll = useSmoothScroll();
 *   // Subscription; the first callback fires synchronously with current state.
 *   useEffect(() => scroll.onScroll((s) => console.log(s.progress)), [scroll]);
 *   return null;
 * }
 * ```
 *
 * Semantics that callers can rely on:
 * - All methods are safe before initialization and under reduced motion.
 *   Without Lenis (reduced motion at mount, or module load failure),
 *   `scrollTo` degrades to an instant native jump; `getScrollState` returns
 *   native values; `onScroll` still delivers per-frame snapshots; `start`
 *   /`stop` are no-ops.
 * - When Lenis IS active and `prefers-reduced-motion` flips on mid-session,
 *   the installed Lenis honors it live: input tracking becomes 1:1 and
 *   programmatic scrolls become instant — no code change needed.
 * - Dropdown/dialog/internal-scroll containers are NOT part of this rail:
 *   mark them `data-lenis-prevent` and they scroll natively.
 */
export function useSmoothScroll(): ScrollApi {
  return useSmoothScrollCore();
}
