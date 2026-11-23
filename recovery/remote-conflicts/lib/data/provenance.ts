/**
 * Data provenance model: every externally retrieved value carries its source
 * and retrieval timestamp; editorial content is labeled static; demos simulated.
 */

export const DataKind = ["static", "cached", "simulated", "live"] as const;
export type DataKind = (typeof DataKind)[number];

export type Freshness = "fresh" | "stale" | "unknown";

export type Provenance = {
  kind: DataKind;
  source: string;
  /** ISO timestamp of retrieval (external) or last editorial review. */
  retrievedAt: string;
  /** ISO timestamp of the source's own update, when known. */
  sourceUpdatedAt: string | null;
  freshness: Freshness;
};

export function freshnessOf(
  fetchedAtIso: string | null,
  maxAgeMs: number,
  nowMs = Date.now(),
): Freshness {
  if (!fetchedAtIso) return "unknown";
  const t = Date.parse(fetchedAtIso);
  if (Number.isNaN(t)) return "unknown";
  return nowMs - t <= maxAgeMs ? "fresh" : "stale";
}

export function isStale(fetchedAtIso: string | null, maxAgeMs: number, nowMs = Date.now()): boolean {
  return freshnessOf(fetchedAtIso, maxAgeMs, nowMs) !== "fresh";
}

/** UI label for a provenance record. Never invents precision. */
export function provenanceLabel(p: Provenance, locale: "en" | "ar" = "en"): string {
  if (p.kind === "static") return locale === "ar" ? "محتوى تحريري" : "Editorial content";
  if (p.kind === "simulated") return locale === "ar" ? "بيانات محاكاة" : "Simulated data";
  if (p.kind === "live") return locale === "ar" ? "بيانات حيّة" : "Live data";
  const date = p.retrievedAt.slice(0, 10);
  const state = p.freshness === "fresh"
    ? locale === "ar" ? "حديثة" : "fresh"
    : locale === "ar" ? "قديمة" : "stale";
  return locale === "ar"
    ? `مخزّنة من ${p.source} · بتاريخ ${date} · ${state}`
    : `Cached from ${p.source} · ${date} · ${state}`;
}
