const ORIGIN = "https://vetwo.dev";

export type LocaleAlternates = {
  canonical: string;
  languages: { en: string; ar: string; "x-default": string };
};

/**
 * Per-page alternate URLs for the /en + /ar route pair.
 * `path` is the locale-independent path ("" for home, "/projects", ...).
 * Every public page must use this so hreflang is never silently dropped by
 * Next.js metadata merging (a page-level `alternates` object replaces the
 * layout's — see certification audit).
 */
export function localeAlternates(path = ""): LocaleAlternates {
  return {
    canonical: `${ORIGIN}/en${path}`,
    languages: {
      en: `${ORIGIN}/en${path}`,
      ar: `${ORIGIN}/ar${path}`,
      "x-default": `${ORIGIN}/en${path}`,
    },
  };
}
