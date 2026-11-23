"use client";

import { useEffect } from "react";

/**
 * Hero motion (GSAP). One timeline orchestrates the hero entrance
 * (badge → heading → lead → CTAs → note → plate → meta strip) and then draws
 * the units-dimension chart: verified runtime edges trace in first, plotted
 * nodes pop in after (see implementation-plan.md §C, rows 1–2).
 *
 * Guarantees:
 * - Server HTML ships fully visible; hidden states are applied by JS at mount,
 *   so no-JS visitors and crawlers never lose content.
 * - `prefers-reduced-motion: reduce` skips the timeline entirely (content
 *   stays in its final, SSR-rendered state; gsap is never imported).
 * - Chart animation only enhances: the SVG is fully rendered server-side and
 *   is merely "animated", never "held" above opacity 0 by markup.
 * - Strict CSP is respected (no inline styles beyond gsap's own element-level
 *   manipulation; no unsafe-inline script needed).
 */
export function HeroMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const root = document.querySelector<HTMLElement>("[data-hero-root]");
    const items = root?.querySelectorAll<HTMLElement>("[data-hero]");
    const edges = root?.querySelectorAll<SVGGeometryElement>("[data-hero-edge]");
    const nodes = root?.querySelectorAll<SVGGElement>("[data-hero-node]");
    if (!items?.length || !root) return;

    let killed = false;
    let ctx: { kill(): void } | undefined;

    (async () => {
      let gsapModule: typeof import("gsap") | undefined;
      try {
        gsapModule = await import("gsap");
      } catch {
        return; // animation is enhancement-only; SSR state already satisfies
      }
      if (killed || !gsapModule) return;
      const gsap = gsapModule.gsap;

      ctx = gsap.context(() => {
        // Entrance: apply hidden state first (JS-only, so no-JS stays visible).
        gsap.set(items, { opacity: 0, y: 14 });
        const tl = gsap.timeline({
          defaults: { duration: 0.6, ease: "power2.out" },
        });
        tl.to(items, { opacity: 1, y: 0, stagger: 0.06, delay: 0.1 });

        // Chart phase rides the end of the entrance, drawn inside the plate.
        if ((edges?.length ?? 0) > 0 || (nodes?.length ?? 0) > 0) {
          if (edges) {
            // Only solid runtime edges (dashed conceptual edges keep their
            // own dasharray and are left untouched).
            edges.forEach((edge) => {
              try {
                const len = edge.getTotalLength();
                edge.style.strokeDasharray = `${len}`;
                edge.style.strokeDashoffset = `${len}`;
              } catch {
                // geometry lookup unsupported; edge simply stays visible
              }
            });
          }
const label = "chart";
          tl.addLabel(label, ">-0.1");
          if (edges) {
            tl.to(
              edges,
              {
                strokeDashoffset: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: "power2.out",
              },
              label,
            );
          }
          if (nodes) {
            tl.from(
              nodes,
              {
                opacity: 0,
                scale: 0.4,
                transformOrigin: "center",
                transformBox: "fill-box",
                duration: 0.35,
                stagger: 0.03,
                ease: "back.out(1.6)",
              },
              label === "chart" ? "chart+=0.25" : "chart",
            );
          }
        }
      }, root);
    })();

    return () => {
      killed = true;
      ctx?.kill();
    };
  }, []);

  // Renders nothing; scopes motion to the hero section by data attribute.
  return null;
}
