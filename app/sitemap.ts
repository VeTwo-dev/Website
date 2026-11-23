import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/docs/content";

const BASE = "https://vetwo.dev";
/** Date the static marketing pages were last reviewed as a set. */
const LAST_REVIEWED = "2026-10-23";

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * Per-locale sitemap with reciprocal hreflang on every entry. Articles use
 * their own catalog `reviewed` date; static pages share the documented set
 * review date. Admin, API, login, and anything user-specific stay out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; lastModified: string }[] = [
    { path: "", lastModified: LAST_REVIEWED },
    { path: "/services", lastModified: LAST_REVIEWED },
    { path: "/about", lastModified: LAST_REVIEWED },
    { path: "/blog", lastModified: LAST_REVIEWED },
    ...ARTICLES.map((a) => ({
      path: `/blog/${a.slug}`,
      lastModified: a.reviewed,
    })),
  ];

  const entry = (
    locale: "en" | "ar",
    page: (typeof pages)[number],
  ): SitemapEntry => ({
    url: `${BASE}/${locale}${page.path}`,
    lastModified: new Date(page.lastModified),
    alternates: {
      languages: {
        en: `${BASE}/en${page.path}`,
        ar: `${BASE}/ar${page.path}`,
        "x-default": `${BASE}/en${page.path}`,
      },
    },
  });

  return (["en", "ar"] as const).flatMap((locale) =>
    pages.map((page) => entry(locale, page)),
  );
}
