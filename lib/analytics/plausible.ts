/**
 * Privacy-friendly analytics boundary.
 * Provider: Plausible (or compatible), optional + environment-driven.
 * - No cookies, no session replay, no behavioral profiling.
 * - Aggregate page views + a small set of meaningful public-site events only.
 * - Analytics failure must never break the site (proved by try/catch + no-op fallback).
 */

export type AnalyticsEvent = "cta_ecosystem" | "cta_docs" | "project_search" | "project_view";

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "";
const PLAUSIBLE_SRC =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";

export function analyticsConfig() {
  return {
    enabled: Boolean(PLAUSIBLE_DOMAIN),
    domain: PLAUSIBLE_DOMAIN,
    src: PLAUSIBLE_SRC,
  };
}

/** Client-safe no-op-safe event sender. Never throws. */
export function trackEvent(_event: AnalyticsEvent, _props?: Record<string, string>): void {
  try {
    const w = window as unknown as { plausible?: (e: string, o?: unknown) => void };
    if (typeof w.plausible === "function") {
      w.plausible(_event, _props ? { props: _props } : undefined);
    }
  } catch {
    // analytics must never break the page
  }
}
