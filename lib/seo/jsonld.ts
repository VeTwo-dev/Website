import type { Article } from "@/lib/docs/content";
import type { Locale } from "@/lib/i18n/config";

const ORIGIN = "https://vetwo.dev";

/**
 * The article's real prose as a description: the Arabic summary for AR, the
 * first paragraph for EN. Never fabricated — falls back to the title only if
 * an article had no prose at all.
 */
export function articleDescription(article: Article, locale: Locale): string {
  if (locale === "ar") return article.summaryAr;
  const first = article.body.find((block) => block.type === "p");
  return first && first.type === "p" ? first.text : article.title;
}

/**
 * BlogPosting structured data for one article.
 *
 * The catalog carries a `reviewed` date and no `datePublished` / `author`, so
 * `dateModified` is emitted and those unsupported properties are omitted —
 * the site does not invent dates or bylines.
 */
export function articleJsonLd(article: Article, locale: Locale) {
  const url = `${ORIGIN}/${locale}/blog/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: locale === "ar" ? article.titleAr : article.title,
    description: articleDescription(article, locale),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: locale === "ar" ? "ar" : "en",
    dateModified: article.reviewed,
    image: `${ORIGIN}/og.png`,
    isPartOf: { "@type": "Blog", "@id": `${ORIGIN}/${locale}/blog` },
    publisher: { "@type": "Organization", name: "VeTwo", url: ORIGIN },
  };
}

/**
 * Serialize JSON-LD without allowing a literal `<` to close the script tag
 * early. All data here is static catalog content, but the escape keeps the
 * injection surface zero if that ever changes.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
