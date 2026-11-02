import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

const GITHUB_URL = "https://github.com/VeTwo-dev";
const NPM_URL = "https://www.npmjs.com/~vetwo.dev";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const links = [
    { href: `/${locale}/services`, label: t.nav.services },
    { href: `/${locale}#projects`, label: t.nav.projects },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/blog`, label: t.nav.blog },
  ];
  const sections = [
    { href: `/${locale}#ecosystem`, label: t.nav.ecosystem },
    { href: `/${locale}#engineering`, label: t.nav.engineering },
  ];
  const externals = [
    { href: GITHUB_URL, label: "GitHub — VeTwo-dev" },
    { href: NPM_URL, label: "npm — ~vetwo.dev" },
  ];

  return (
    <footer className="border-t border-border">
      <div className="container-content grid gap-10 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="max-w-md text-balance text-2xl font-semibold sm:text-3xl">{t.footer.tagline}</p>
          <p className="mt-4 max-w-sm text-pretty text-sm text-secondary">{t.footer.rights}</p>
        </div>
        <nav aria-label={t.common.footerNav} className="md:col-span-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[11px] text-secondary">VeTwo</p>
              <ul className="mt-4 flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="inline-flex min-h-11 items-center text-sm text-secondary transition-colors hover:text-primary"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] text-secondary">{t.nav.home}</p>
              <ul className="mt-4 flex flex-col gap-1">
                {sections.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="inline-flex min-h-11 items-center text-sm text-secondary transition-colors hover:text-primary"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] text-secondary">{t.footer.contact}</p>
              <ul className="mt-4 flex flex-col gap-1">
                {externals.map((link) => (
                  <li key={link.href}>
                    <a
                      className="inline-flex min-h-11 items-center text-sm text-secondary transition-colors hover:text-primary"
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>

      <p aria-hidden="true" className="footer-wordmark container-content">
        VeTwo
      </p>

      <div className="container-content flex flex-wrap items-center justify-between gap-3 border-t border-border py-5 font-mono text-[11px] text-secondary">
        <span>© {new Date().getFullYear()} VeTwo</span>
        <span dir="ltr">vetwo.dev</span>
      </div>
    </footer>
  );
}
