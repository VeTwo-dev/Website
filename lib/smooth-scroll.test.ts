import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { SMOOTH_SCROLL_CONFIG, resolveNativeTop } from "./smooth-scroll";

/**
 * `resolveNativeTop` is a browser-only degraded fallback. It runs in the
 * vitest "node" environment here against minimal DOM-shaped stubs, which is
 * exactly the shape the function aims at (scrollHeight/innerHeight/rects).
 */
beforeAll(() => {
  (globalThis as Record<string, unknown>).window = { innerHeight: 800, scrollY: 0 };
  (globalThis as Record<string, unknown>).document = {
    documentElement: { scrollHeight: 3000 },
    // No createElement/querySelector: these tests only exercise numeric,
    // "top"/"bottom" and unmatched-selector paths; the element path and the
    // selector path that query real DOM are browser-only.
    querySelector: () => null,
  };
});

afterEach(() => {
  // no stored state: the stubs are static for the whole run.
});

describe("SMOOTH_SCROLL_CONFIG", () => {
  it("commits to Lenis' deliberate, conservative defaults (verified against 1.3.27)", () => {
    expect(SMOOTH_SCROLL_CONFIG.lerp).toBe(0.1);
    expect(SMOOTH_SCROLL_CONFIG.smoothWheel).toBe(true);
    expect(SMOOTH_SCROLL_CONFIG.syncTouch).toBe(false); // native touch on mobile
    expect(SMOOTH_SCROLL_CONFIG.wheelMultiplier).toBe(1);
    expect(SMOOTH_SCROLL_CONFIG.touchMultiplier).toBe(1);
    expect(SMOOTH_SCROLL_CONFIG.orientation).toBe("vertical");
    expect(SMOOTH_SCROLL_CONFIG.gestureOrientation).toBe("vertical");
    expect(SMOOTH_SCROLL_CONFIG.infinite).toBe(false);
    expect(SMOOTH_SCROLL_CONFIG.anchors).toBe(true);
    expect(SMOOTH_SCROLL_CONFIG.stopInertiaOnNavigate).toBe(true);
    expect(SMOOTH_SCROLL_CONFIG.respectReducedMotion).toBe(true);
    // Driven by the GSAP ticker — Lenis' own RAF loop must not also run.
    expect(SMOOTH_SCROLL_CONFIG.autoRaf).toBe(false);
  });
});

describe("resolveNativeTop (native fallback path)", () => {
  const LIMIT = 3000 - 800;

  it("resolves 'bottom' to the document end", () => {
    expect(resolveNativeTop("bottom", 0)).toBe(LIMIT);
  });

  it("resolves +Infinity (scrollToBottom sentinel) to the document end", () => {
    expect(resolveNativeTop(Number.POSITIVE_INFINITY, 0)).toBe(LIMIT);
  });

  it("clamps numeric targets into [0, limit]", () => {
    expect(resolveNativeTop(10_000, 0)).toBe(LIMIT);
    expect(resolveNativeTop(-9999, 0)).toBe(0);
  });

  it("adds the offset before clamping", () => {
    expect(resolveNativeTop(100, -20)).toBe(80);
    expect(resolveNativeTop(LIMIT + 100, -50)).toBe(LIMIT);
  });

  it("resolves 'top' (any offset) from 0", () => {
    expect(resolveNativeTop("top", 0)).toBe(0);
    expect(resolveNativeTop("top", 48)).toBe(48);
  });

  it("degrades to 0 when a selector matches nothing", () => {
    expect(resolveNativeTop("#missing-target-xyz", 0)).toBe(0);
  });
});
