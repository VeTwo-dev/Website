"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  activationThreshold?: number;
  hideThreshold?: number;
  inset?: number;
};

export function RulerScrollProgress({
  activationThreshold = 2,
  hideThreshold = 0.5,
  inset = 8,
}: Props) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const springValue = useSpring(scrollYProgress, {
    damping: 30,
    mass: 0.4,
    stiffness: 220,
  });
  const value = shouldReduceMotion ? scrollYProgress : springValue;

  const [progress, setProgress] = useState(0);
  const [display, setDisplay] = useState(0);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsRtl(el.getAttribute("dir") === "rtl");
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["dir"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const p = latest * 100;
    if (p >= activationThreshold) setVisible(true);
    else if (p <= hideThreshold) setVisible(false);
  });
  useMotionValueEvent(value, "change", (latest) => {
    const p = latest * 100;
    setProgress(p);
    const r = Math.round(p);
    setDisplay((prev) => (prev === r ? prev : r));
  });

  const innerWidth = Math.max(0, width - inset * 2);

  // tick intervals
  const minorInterval = useMemo(() => {
    if (innerWidth >= 900) return 1;
    if (innerWidth >= 500) return 2;
    if (innerWidth >= 250) return 5;
    return 10;
  }, [innerWidth]);

  const ticks = useMemo(() => {
    const arr: number[] = [];
    for (let t = 0; t <= 100; t += minorInterval) arr.push(t);
    if (arr[arr.length - 1] !== 100) arr.push(100);
    return arr;
  }, [minorInterval]);

  const isMajor = (t: number) => t % 10 === 0;
  const isMedium = (t: number) => t % 5 === 0 && t % 10 !== 0;

  // indicator position (physical px within inner ruler)
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const endpointPct = isRtl ? 100 - clampedProgress : clampedProgress;
  // clamp indicator center within [0,100] of inner width
  const indicatorPct = Math.min(97, Math.max(3, endpointPct));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ruler"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          className="pointer-events-none"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={display}
          aria-label="Page scroll progress"
        >
          <div
            ref={containerRef}
            className="relative h-6 w-full border-b border-border bg-transparent"
            style={{ paddingInline: inset }}
          >
            {/* indicator box */}
            <motion.div
              className="absolute top-full z-10 mt-px min-w-[2.25rem] rounded border border-border bg-surface p-px text-center text-[10px] font-mono font-bold text-accent shadow-sm"
              style={{
                left: `${indicatorPct}%`,
                transform: "translateX(-50%)",
              }}
              transition={{
                type: shouldReduceMotion ? "tween" : "spring",
                stiffness: 220,
                damping: 30,
              }}
            >
              {display}%
            </motion.div>

            {/* ticks */}
            {ticks.map((t) => {
              const major = isMajor(t);
              const medium = isMedium(t);
              const active = t <= progress;
              const x = isRtl ? 100 - t : t;
              return (
                <span
                  key={t}
                  aria-hidden="true"
                  className={`absolute bottom-0 flex flex-col items-center ${active ? "text-accent" : "text-secondary/40"}`}
                  style={{ left: `${x}%`, transform: "translateX(-50%)" }}
                >
                  <span
                    className={
                      major
                        ? "h-3 w-px bg-current"
                        : medium
                          ? "h-2 w-px bg-current/80"
                          : "h-1 w-px bg-current/60"
                    }
                  />
                  {major && <span className="text-[8px] font-mono">{t}%</span>}
                </span>
              );
            })}

            {/* progress bar */}
            <motion.div
              className="absolute bottom-0 h-0.5 rounded bg-accent"
              style={{
                width: `${clampedProgress}%`,
                left: isRtl ? "auto" : 0,
                right: isRtl ? 0 : "auto",
                transformOrigin: isRtl ? "right" : "left",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RulerScrollProgress;
