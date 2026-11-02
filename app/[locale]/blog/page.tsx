import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { localeAlternates } from "@/lib/seo/alternates";
import { ARTICLES, SECTIONS, articlesBySection } from "@/lib/docs/content";
import { Button, PageIntro, CtaBand } from "@/components/ui";

export const metadata: Metadata = {
  title: "Engineering notes",
  description:
    "VeTwo documentation and engineering notes, written from verified sources and reviewed against the repositories.",
  alternates: localeAlternates("/blog"),
};

const GITHUB_URL = "https://github.com/VeTwo-dev";

function excerpt(article: (typeof ARTICLES)[number], locale: string): string {
  if (locale === "ar") return article.summaryAr;
  const first = article.body.find((block) => block.type === "p");
  return first && first.type === "p" ? first.text : "";
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDict(locale);
  const copy = t.pages.blog;

  return (
    <div>
      <PageIntro eyebrow={`${copy.eyebrow} · ${ARTICLES.length}`} title={copy.title} lead={copy.lead}>
        <p className="mt-8 max-w-2xl border-s-2 border-accent/50 ps-4 text-sm text-pretty text-secondary">
          {copy.notice}
        </p>
      </PageIntro>

      <section className="container-content scroll-mt-24 py-16 sm:py-20">
        {SECTIONS.map((section) => {
          const items = articlesBySection(section.id);
          if (items.length === 0) return null;
          return (
            <div key={section.id} className="mb-14 last:mb-0">
              <div className="flex items-center gap-4 border-t border-border pt-3 font-mono text-xs text-secondary">
                <span className="text-mint">
                  [{String(SECTIONS.indexOf(section) + 1).padStart(2, "0")}]
                </span>
                <span>{locale === "ar" ? section.titleAr : section.title}</span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <span>
                  {items.length} {locale === "ar" ? "ملاحظة" : items.length === 1 ? "note" : "notes"}
                </span>
              </div>
              <ul>
                {items.map((article, i) => (
                  <li key={article.slug}>
                    <Link
                      href={`/${locale}/blog/${article.slug}`}
                      className="group grid gap-3 border-t border-border py-7 transition-colors hover:border-accent/50 focus-visible:outline-accent lg:grid-cols-12 lg:gap-6"
                    >
                      <span className="font-mono text-xs text-secondary lg:col-span-1">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="lg:col-span-4">
                        <span className="block text-lg font-semibold group-hover:text-mint">
                          {locale === "ar" ? article.titleAr : article.title}
                        </span>
                        <span className="mt-1 block font-mono text-[11px] text-secondary">
                          {article.stability} · {article.reviewed}
                        </span>
                      </span>
                      <span className="line-clamp-3 max-w-prose text-pretty text-sm text-secondary lg:col-span-6">
                        {excerpt(article, locale)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="hidden font-mono text-xs text-mint lg:col-span-1 lg:block lg:text-end"
                      >
                        ↗
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <CtaBand title={copy.cta} lead={copy.lead}>
        <Button href={GITHUB_URL} external>
          {t.hero.tertiary}
        </Button>
        <Button href={`/${locale}#projects`} variant="secondary">
          {t.hero.primary}
          <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
        </Button>
      </CtaBand>
    </div>
  );
}
