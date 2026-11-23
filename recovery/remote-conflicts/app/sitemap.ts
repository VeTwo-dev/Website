import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/docs/content";

const BASE = "https://vetwo.dev";
const LAST_REVIEWED = "2026-10-23";

/**
 * Public pages plus the documentation notes. Admin, API, and anything
 * user-specific stay out of the index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/services", "/about", "/blog", ...ARTICLES.map((a) => `/blog/${a.slug}`)];
  return (["en", "ar"] as const).flatMap((locale) =>
    paths.map((path) => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: new Date(LAST_REVIEWED),
    })),
  );
}
