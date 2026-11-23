"use client";

import { useEffect, useRef } from "react";

/**
 * Editorial statement. The English variant stacks an outline copy under a
 * solid copy and reveals the solid copy as the block scrolls into place — the
 * reference's "outline → fill" device, restricted to Latin text because
 * stroked Arabic glyphs are not legible.
 *
 * The solid layer always holds the real text, so assistive technology and
 * no-JS visitors read the statement regardless of the animation state.
 */
export function Statement({
  text,
  outline = true,
  className = "",
}: {
  text: string;
  outline?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !outline) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      element.style.setProperty("--statement-fill", "1");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const top = element.getBoundingClientRect().top;
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.25;
      const progress = Math.min(1, Math.max(0, (start - top) / (start - end)));
      element.style.setProperty("--statement-fill", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [outline]);

  return (
    <div ref={ref} className={`statement ${className}`} style={{ "--statement-fill": "1" } as React.CSSProperties}>
      {outline ? (
        <span className="statement-outline" aria-hidden="true">
          {text}
        </span>
      ) : null}
      <span className="statement-solid">{text}</span>
    </div>
  );
}
