import type { Locale } from "@/lib/i18n/config";

const ORIGIN = "https://vetwo.dev";

export type LocaleAlternates = {
  canonical: string;
  languages: { en: string; ar: string; "x-default": string };
};

/**
 * Per-page alternate URLs for the /en + /ar route pair.
 *
 * `path` is the locale-independent path ("" for home, "/services", ...) and
 * `locale` is the locale of the page being rendered. The canonical is always
 * self-referencing: an Arabic page canonicals to its own Arabic URL, never to
 * its English twin (that would de-index the translation). `hreflang` carries
 * the full reciprocal set — en, ar, and x-default (English) — so search
 * engines can pair the two localized surfaces.
 *
 * Call this from `generateMetadata` (never a static `metadata` export), so
 * the locale is available and hreflang is not silently dropped by Next.js
 * metadata merging (a page-level `alternates` object replaces the layout's —
 * see the certification audit).
 */
export function localeAlternates(
  path = "",
  locale: Locale = "en",
): LocaleAlternates {
  const suffix = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return {
    canonical: `${ORIGIN}/${locale}${suffix}`,
    languages: {
      en: `${ORIGIN}/en${suffix}`,
      ar: `${ORIGIN}/ar${suffix}`,
      "x-default": `${ORIGIN}/en${suffix}`,
    },
  };
}
