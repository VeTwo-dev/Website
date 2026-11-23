"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

/** Primary site navigation with route-aware current-page state. */
export function PrimaryNav({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const pathname = usePathname();
  const items = [
    { href: `/${locale}/services`, label: t.nav.services },
    { href: `/${locale}#projects`, label: t.nav.projects },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/blog`, label: t.nav.blog },
  ];

  return (
    <nav aria-label={t.common.primaryNav} className="hidden items-center gap-4 md:flex lg:gap-6">
      {items.map((item, i) => {
        const base = item.href.split("#")[0];
        const isAnchor = item.href.includes("#");
        const active = !isAnchor && (pathname === base || pathname.startsWith(`${base}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              "nav-roll inline-flex items-baseline gap-2 text-sm transition-colors hover:text-primary focus-visible:outline-accent " +
              (active ? "text-primary" : "text-secondary")
            }
          >
            <span aria-hidden="true" className="hidden font-mono text-[11px] text-mint lg:inline">
              0{i + 1}
            </span>
            <span className="nav-roll-label" data-label={item.label}>
              <span>{item.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
