import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { localeAlternates } from "@/lib/seo/alternates";
import { PROJECTS, getProject } from "@/lib/projects/data";
import { NPM_PACKAGE_MAP } from "@/lib/external/npm";
import { VERIFIED_EDGES } from "@/lib/ecosystem/graph";
import { Button, PageIntro, SectionHead, CtaBand, MetaRow } from "@/components/ui";
import { Statement } from "@/components/statement";

export const metadata: Metadata = {
  title: "Capabilities",
  description:
    "What VeTwo builds: a dimensional units engine, nutrition and feed-formulation rules, developer infrastructure, and open-source distribution.",
  alternates: localeAlternates("/services"),
};

const GITHUB_URL = "https://github.com/VeTwo-dev";
const NPM_URL = "https://www.npmjs.com/~vetwo.dev";

/** Layer index → verified repository slug (or null for the npm scope). */
const LAYER_PROJECTS: (string | null)[] = ["units", "nutrition-units", "whichenv", null];

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDict(locale);
  const isArabic = locale === "ar";
  const copy = t.pages.services;
  const runtimeEdges = VERIFIED_EDGES.filter((e) => e.kind === "runtime");
  const packageCount = Object.keys(NPM_PACKAGE_MAP).length;

  return (
    <div>
      <PageIntro eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

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
          meta={`${PROJECTS.length} ${t.home.projects.toLowerCase()}`}
          title={copy.layersTitle}
          sub={copy.layersSub}
          display={!isArabic}
        />
        <ol className="mt-12">
          {copy.layers.map((layer, i) => {
            const slug = LAYER_PROJECTS[i];
            const project = slug ? getProject(slug) : undefined;
            const href = project?.repository ?? NPM_URL;
            return (
              <li
                key={layer.title}
                className="grid gap-4 border-t border-border py-8 lg:grid-cols-12 lg:gap-6"
              >
                <p className="font-mono text-xs text-mint lg:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="lg:col-span-4">
                  <h2 className="text-balance text-xl font-semibold">{layer.title}</h2>
                  <p className="mt-2 font-mono text-[11px] text-secondary" dir="ltr">
                    {layer.meta}
                  </p>
                </div>
                <div className="lg:col-span-6">
                  <p className="max-w-prose text-pretty text-secondary">{layer.body}</p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex min-h-[44px] items-center gap-2 font-mono text-xs text-mint hover:text-primary focus-visible:outline-accent"
                  >
                    {project ? project.name : "npm · @vetwo"}
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="container-content grid gap-10 py-20 sm:py-24 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead index="02" label={copy.principlesLabel} title={copy.principlesTitle} />
          </div>
          <ul className="lg:col-span-7">
            {copy.principles.map((principle) => (
              <li
                key={principle}
                className="border-t border-border py-4 text-pretty text-secondary first:border-t-0 first:pt-0"
              >
                {principle}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-content py-16 sm:py-20">
        <MetaRow
          items={[
            { value: String(PROJECTS.length), label: t.home.projects },
            { value: String(packageCount), label: t.home.packages },
            { value: String(runtimeEdges.length), label: t.home.deps },
            { value: "TypeScript", label: t.home.stack },
          ]}
        />
      </section>

      <CtaBand title={copy.cta} lead={copy.ctaSub}>
        <Button href={`/${locale}#projects`}>
          {t.hero.primary}
          <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
        </Button>
        <Button href={GITHUB_URL} variant="secondary" external>
          {t.hero.tertiary}
        </Button>
      </CtaBand>
    </div>
  );
}
