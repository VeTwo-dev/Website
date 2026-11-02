import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowRight } from "lucide-react";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { localeAlternates } from "@/lib/seo/alternates";
import { PROJECTS, getProject } from "@/lib/projects/data";
import { NPM_PACKAGE_MAP } from "@/lib/external/npm";
import { VERIFIED_EDGES } from "@/lib/ecosystem/graph";
import {
  Button,
  SectionHead,
  WorkRow,
  ProcessStep,
  Plate,
  MetaRow,
} from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { MediaSlot } from "@/components/media-slot";
import { HeroChart } from "@/components/hero-chart";
import { Statement } from "@/components/statement";
import { HeroMotion } from "@/components/hero-motion";
import { VeTwoCircuitBackground } from "@/components/Logo/src";

export const metadata: Metadata = {
  title: "VeTwo — Open-Source Solutions for Animal Healthcare",
  description:
    "Revolutionizing Veterinary care through Engineering & Code. Open-source VetTech, scientific tooling, and developer infrastructure.",
  alternates: localeAlternates(""),
};

const GITHUB_URL = "https://github.com/VeTwo-dev";

function featuredSlugs(): string[] {
  const slugs = PROJECTS.filter((p) => p.featured).map((p) => p.slug);
  return slugs.length > 0
    ? slugs.slice(0, 4)
    : PROJECTS.slice(0, 4).map((p) => p.slug);
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDict(locale);
  const isArabic = locale === "ar";
  const featured = featuredSlugs()
    .map((s) => getProject(s))
    .filter((p) => p !== undefined);
  const runtimeEdges = VERIFIED_EDGES.filter((e) => e.kind === "runtime");
  const packageCount = Object.keys(NPM_PACKAGE_MAP).length;
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VeTwo",
    url: "https://vetwo.dev",
    slogan: "Revolutionizing Veterinary care through Engineering & Code",
    sameAs: [
      "https://github.com/VeTwo-dev",
      "https://www.npmjs.com/~vetwo.dev",
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section data-hero-root className="relative isolate scroll-mt-24 overflow-hidden border-b border-border">
        <HeroMotion />
        <VeTwoCircuitBackground
          className="hero-circuit"
          style={{ position: "absolute", inset: 0, zIndex: -1 }}
          fit="cover"
          opacity={1}
          contrast={0.5}
          density={0.55}
          glowIntensity={0.4}
          backgroundColor="var(--color-background)"
          color="var(--color-secondary-green)"
          secondaryColor="var(--color-secondary-green)"
          glowColor="var(--color-secondary-green)"
          nonce={nonce}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-48 inset-s-1/3 size-120 rounded-full bg-mint/[0.07] blur-[100px]"
        />
        <div className="container-content relative grid items-center gap-12 pt-34 pb-16 lg:grid-cols-12 lg:gap-10 lg:pt-38 lg:pb-20">
          <div className="lg:col-span-6">
            <p data-hero className="font-mono text-[11px] text-secondary">
              <span className="text-mint">FIG. 00</span>
              <span aria-hidden="true"> · </span>
              {t.hero.badge}
            </p>
            <h1 data-hero className="text-balance text-display mt-6 max-w-2xl font-bold">
              {t.hero.title}
            </h1>
            <p data-hero className="mt-5 max-w-xl text-pretty text-lg text-secondary">
              {t.hero.subtitle}
            </p>
            <div data-hero className="mt-8 flex flex-wrap items-center gap-3">
              <Button href={`/${locale}#projects`}>
                {t.hero.primary}
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="rtl:rotate-180"
                />
              </Button>
              <Button href={GITHUB_URL} variant="secondary" external>
                {t.hero.tertiary}
              </Button>
            </div>
            <p data-hero className="mt-6 max-w-xl text-xs text-secondary">
              {t.hero.note}
            </p>
          </div>
          <div data-hero className="w-full min-w-0 lg:col-span-6">
            <Plate
              label={
                isArabic
                  ? "رسم توضيحي · مخطط أبعاد الوحدات"
                  : "FIG. 01 · UNITS DIMENSION CHART"
              }
              meta="EDITORIAL SVG"
            >
              <MediaSlot
                id="home.hero.primary-visual"
                locale={locale}
                caption={t.common.mediaPlaceholder}
              >
                <div className="hero-chart-scroll" tabIndex={0}>
                  <HeroChart
                    label={
                      isArabic
                        ? "مخطط أبعاد الوحدات وحزم VeTwo"
                        : "VeTwo units-dimension chart with package nodes"
                    }
                  />
                </div>
              </MediaSlot>
            </Plate>
          </div>
        </div>
        <div className="container-content relative pb-14 lg:pb-16">
          <div data-hero>
            <MetaRow
              items={[
                { value: String(PROJECTS.length), label: t.home.projects },
                { value: String(packageCount), label: t.home.packages },
                { value: String(runtimeEdges.length), label: t.home.deps },
                { value: "TypeScript", label: t.home.stack },
              ]}
            />
          </div>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="container-content py-20 sm:py-24 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Statement
              text={t.statement.title}
              outline={!isArabic}
              className="text-statement font-display"
            />
          </div>
          <div className="lg:col-span-4 lg:pt-3">
            <p className="max-w-prose text-pretty text-secondary">
              {t.statement.sub}
            </p>
          </div>
        </div>
      </section>

      {/* [01] SELECTED WORK */}
      <section
        id="projects"
        className="container-content scroll-mt-24 py-20 sm:py-24"
      >
        <SectionHead
          index="01"
          label={t.sectionLabels.work}
          meta={`${featured.length} ${t.nav.projects.toLowerCase()}`}
          title={t.sections.featured}
          sub={t.sections.featuredSub}
          display={!isArabic}
        />
        <div className="mt-12">
          {featured.map((project, i) => (
            <Reveal key={project.slug} delay={i * 60}>
              <WorkRow
                index={String(i + 1).padStart(2, "0")}
                total={String(featured.length).padStart(2, "0")}
                name={project.name}
                category={project.category}
                status={project.status}
                description={
                  isArabic && project.descriptionAr
                    ? project.descriptionAr
                    : project.description
                }
                technologies={project.technologies}
                date={project.updatedAt}
                href={project.repository}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* [02] ECOSYSTEM */}
      <section
        id="ecosystem"
        className="scroll-mt-24 border-y border-border bg-surface/40"
      >
        <div className="container-content py-20 sm:py-24">
          <SectionHead
            index="02"
            label={t.sectionLabels.ecosystem}
            title={t.home.preview}
            sub={t.home.previewSub}
            display={!isArabic}
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <ul className="flex flex-col">
                {runtimeEdges.map((edge) => (
                  <li
                    key={`${edge.from}>${edge.to}`}
                    className="border-t border-border py-3 font-mono text-sm"
                  >
                    <span className="text-primary" dir="ltr">
                      {edge.from}
                    </span>
                    <span aria-hidden="true" className="mx-2 text-secondary">
                      →
                    </span>
                    <span className="text-primary" dir="ltr">
                      {edge.to}
                    </span>
                    <span className="ms-2 text-mint" dir="ltr">
                      {edge.range}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-secondary">
                {isArabic
                  ? "اعتمادية مثبتة من ملف الحزمة"
                  : "Manifest-verified dependency"}
              </p>
            </div>
            <Reveal className="lg:col-span-7">
              <Plate
                label={
                  isArabic
                    ? "رسم توضيحي · بنية المنظومة"
                    : "FIG. 02 · ECOSYSTEM COMPOSITION"
                }
                meta="EDITORIAL SVG"
              >
                <MediaSlot
                  id="home.ecosystem.feature-visual"
                  locale={locale}
                  caption={t.common.mediaPlaceholder}
                />
              </Plate>
            </Reveal>
          </div>
        </div>
      </section>

      {/* [03] ENGINEERING */}
      <section
        id="engineering"
        className="container-content scroll-mt-24 py-20 sm:py-24"
      >
        <SectionHead
          index="03"
          label={t.sectionLabels.engineering}
          title={t.home.philosophy}
          sub={t.home.philosophySub}
          display={!isArabic}
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            { title: t.home.p1t, desc: t.home.p1d },
            { title: t.home.p2t, desc: t.home.p2d },
            { title: t.home.p3t, desc: t.home.p3d },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <ProcessStep
                index={String(i + 1).padStart(2, "0")}
                title={item.title}
                description={item.desc}
              />
            </Reveal>
          ))}
        </div>
        <p className="mt-10 font-mono text-xs text-mint" dir="ltr">
          mg/kg ≠ % —{" "}
          <span className="text-secondary">
            {isArabic ? "مثال توضيحي" : "illustrative example"}
          </span>
        </p>
      </section>

      {/* [04] NEXT */}
      <section className="border-t border-border">
        <div className="container-content py-24 sm:py-28">
          <p className="font-mono text-xs text-secondary">
            <span className="text-mint">[04]</span>
            <span aria-hidden="true"> · </span>
            {t.sectionLabels.next}
          </p>
          <h2 className="mt-6 max-w-4xl text-balance text-statement font-display">
            {t.home.closing}
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-secondary">
            {t.home.closingSub}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={GITHUB_URL} external>
              {t.hero.tertiary}
            </Button>
            <Button href={`/${locale}#projects`} variant="secondary">
              {t.hero.primary}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
