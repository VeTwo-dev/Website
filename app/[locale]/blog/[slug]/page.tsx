import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { pageMetadata } from "@/lib/seo/page-meta";
import {
  articleDescription,
  articleJsonLd,
  serializeJsonLd,
} from "@/lib/seo/jsonld";
import { SECTIONS, getArticle } from "@/lib/docs/content";
import { ArticleBody } from "@/components/article-body";

type Params = { locale: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const article = getArticle(slug);
  if (!article) return { title: "Note not found" };
  const description =
    locale === "ar"
      ? `${article.summaryAr} ${getDict(locale).pages.blog.lead}`
      : articleDescription(article, locale);
  return pageMetadata({
    locale,
    path: `/blog/${article.slug}`,
    title: locale === "ar" ? article.titleAr : article.title,
    description,
    article: { modifiedTime: article.reviewed },
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const isArabic = locale === "ar";
  const t = getDict(locale);
  const copy = t.pages.blog;
  const article = getArticle(slug);
  if (!article) notFound();

  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const jsonLd = serializeJsonLd(articleJsonLd(article, locale));

  const section = SECTIONS.find((s) => s.id === article.section);

  return (
    <article>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <header className="border-b border-border">
        <div className="container-content pt-32 pb-14 sm:pt-40 sm:pb-16">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex min-h-[44px] items-center gap-2 font-mono text-xs text-secondary transition-colors hover:text-primary focus-visible:outline-accent"
          >
            <span aria-hidden="true">←</span>
            {copy.back}
          </Link>
          <p className="mt-6 font-mono text-[11px] text-secondary">
            <span className="text-mint">
              {section
                ? isArabic
                  ? section.titleAr
                  : section.title
                : copy.eyebrow}
            </span>
            <span aria-hidden="true"> · </span>
            {t.pages.blog.eyebrow}
          </p>
          <h1 className="text-display mt-4 max-w-4xl font-bold">
            {isArabic ? article.titleAr : article.title}
          </h1>
          {isArabic ? (
            <p className="mt-5 max-w-2xl text-pretty text-secondary">
              {article.summaryAr}
            </p>
          ) : null}
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] text-secondary">
            <div className="flex gap-2">
              <dt>{copy.stability}</dt>
              <dd className="text-primary">{article.stability}</dd>
            </div>
            <div className="flex gap-2">
              <dt>{copy.readNote}</dt>
              <dd dir="ltr">{article.reviewed}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="container-content py-14 sm:py-16">
        {isArabic ? (
          <p className="mb-8 max-w-3xl border-s-2 border-border ps-4 text-sm text-pretty text-secondary">
            {copy.englishOnly}
          </p>
        ) : null}
        <ArticleBody blocks={article.body} />

        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-border pt-8">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex min-h-[44px] items-center gap-2 font-mono text-xs text-mint hover:text-primary focus-visible:outline-accent"
          >
            <span aria-hidden="true">←</span>
            {copy.back}
          </Link>
          <a
            href="https://github.com/VeTwo-dev"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center font-mono text-xs text-secondary hover:text-primary focus-visible:outline-accent"
          >
            {t.hero.tertiary} ↗
          </a>
        </div>
      </div>
    </article>
  );
}
