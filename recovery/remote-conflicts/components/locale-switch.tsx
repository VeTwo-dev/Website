"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

/** Language switch preserving the current path across locales. */
export function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const other: Locale = locale === "en" ? "ar" : "en";
  const target = pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${other}`);
  return (
    <Link
      href={target === pathname ? `/${other}` : target}
      hrefLang={other}
      aria-label={other === "ar" ? "التبديل إلى العربية" : "EN — التبديل إلى الإنجليزية"}
      className="inline-flex min-h-[44px] items-center rounded-control border border-input px-3 text-xs font-semibold text-secondary hover:text-primary"
    >
      {other === "ar" ? "العربية" : "EN"}
    </Link>
  );
}
