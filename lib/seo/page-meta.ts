import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { localeAlternates } from "./alternates";

/** Default social card (1200×630, generated from VeTwo brand tokens). */
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "VeTwo — open-source veterinary technology",
} as const;

type PageMetadataInput = {
  locale: Locale;
  /** Locale-independent path, "" for home. */
  path: string;
  title: string;
  description: string;
  /** Use the title verbatim instead of applying the layout's `%s` template. */
  absoluteTitle?: boolean;
  /** Article metadata for blog posts; omitted for static pages. */
  article?: { modifiedTime?: string };
};

/**
 * Consistent metadata for one localized public route.
 *
 * - Canonical is self-referencing for `locale` (an Arabic page never points at
 *   its English twin) while hreflang carries the reciprocal en/ar set.
 * - Open Graph and Twitter reuse the same title, description, URL and image,
 *   so social cards never silently fall back to the home page.
 * - Only real content is used: callers pass copy that exists in the dictionary
 *   or the catalog.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
  article,
}: PageMetadataInput): Metadata {
  const alternates = localeAlternates(path, locale);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates,
    openGraph: {
      type: article ? "article" : "website",
      title,
      description,
      url: alternates.canonical,
      siteName: "VeTwo",
      locale: locale === "ar" ? "ar_AR" : "en_US",
      images: [OG_IMAGE],
      ...(article?.modifiedTime ? { modifiedTime: article.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
