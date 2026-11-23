import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { localeAlternates } from "@/lib/seo/alternates";
import { PROJECTS } from "@/lib/projects/data";
import { NPM_PACKAGE_MAP } from "@/lib/external/npm";
import { VERIFIED_EDGES } from "@/lib/ecosystem/graph";
import { Button, PageIntro, SectionHead, CtaBand, MetaRow } from "@/components/ui";
import { Statement } from "@/components/statement";

export const metadata: Metadata = {
  title: "About",
  description:
    "VeTwo works where veterinary medicine meets typed, tested, open-source engineering: units as dimensions, small packages, and claims that stay labeled.",
  alternates: localeAlternates("/about"),
};

const GITHUB_URL = "https://github.com/VeTwo-dev";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDict(locale);
  const isArabic = locale === "ar";
  const copy = t.pages.about;
  const runtimeEdges = VERIFIED_EDGES.filter((e) => e.kind === "runtime");
  const packageCount = Object.keys(NPM_PACKAGE_MAP).length;

  return (
    <div>
      <PageIntro eyebrow={`${copy.eyebrow} · VeTwo`} title={copy.title} lead={copy.lead} />

      <section className="container-content py-16 sm:py-20">
        <Statement
          text={copy.statement}
          outline={!isArabic}
          className="text-statement max-w-5xl font-display"
        />
      </section>

      <section className="container-content scroll-mt-24 pb-20 sm:pb-24">
        <SectionHead
          index="01"
          label={copy.eyebrow}
          meta={
            isArabic
              ? "أربعة مبادئ تحكم ما ننشره"
              : "Four positions that govern what we publish"
          }
          title={copy.positionsTitle}
          display={!isArabic}
        />
        <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
          {copy.sections.map((section, i) => (
            <article key={section.title} className="border-t border-border pt-4">
              <p className="font-mono text-xs text-mint">[{String(i + 1).padStart(2, "0")}]</p>
              <h2 className="mt-3 text-balance text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 max-w-prose text-pretty text-secondary">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="container-content py-16 sm:py-20">
          <MetaRow
            items={[
              { value: String(PROJECTS.length), label: t.home.projects },
              { value: String(packageCount), label: t.home.packages },
              { value: String(runtimeEdges.length), label: t.home.deps },
              { value: "TypeScript", label: t.home.stack },
            ]}
          />
        </div>
      </section>

      <CtaBand title={copy.cta} lead={copy.ctaSub}>
        <Button href={`/${locale}/blog`}>
          {copy.cta}
          <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
        </Button>
        <Button href={GITHUB_URL} variant="secondary" external>
          {t.hero.tertiary}
        </Button>
      </CtaBand>
    </div>
  );
}
