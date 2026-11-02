import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { LocaleSwitch } from "./locale-switch";

import { PaletteTrigger } from "./palette-trigger";
import { PrimaryNav } from "./primary-nav";
// import ScrollProgress from './smoothui/scroll-progress/index';
import { ThemeToggle } from "./theme-toggle";
import RulerScrollProgress from "./ruler-scroll-progress";

const GITHUB_URL = "https://github.com/VeTwo-dev";

export function Header({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <header className="site-header fixed inset-x-0 top-0 z-40">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:inset-s-2 focus:top-2 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-onAccent"
      >
        {t.common.skip}
      </a>
      <div className="container-content flex h-18 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex min-h-11 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-flex size-8 items-center justify-center rounded-control border border-accent/40 bg-accent/10 font-mono text-sm font-bold text-mint"
          >
            V2
          </span>
          <span className="font-mono text-sm font-semibold">
            VeTwo<span className="text-mint">.dev</span>
          </span>
        </Link>

        <PrimaryNav locale={locale} />

        <div className="flex items-center gap-2">
          <ThemeToggle locale={locale} />
          <LocaleSwitch locale={locale} />
          <PaletteTrigger locale={locale} className="max-sm:hidden" />
          <PaletteTrigger locale={locale} variant="menu" className="sm:hidden" />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-11 items-center rounded-control bg-accent px-4 text-xs font-bold text-onAccent transition-colors hover:brightness-110 focus-visible:outline-accent lg:inline-flex"
          >
            GitHub
          </a>
        </div>
      </div>
      <RulerScrollProgress/>
    </header>
  );
}
