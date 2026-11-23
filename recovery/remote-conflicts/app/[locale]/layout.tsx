import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Roboto_Mono } from "next/font/google";
import "../globals.css";
import "../tokens.css";
import { dirOf, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CommandPalette, type PaletteItem } from "@/components/command-palette";
import { PageTransition } from "@/components/page-transition";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

export const metadata: Metadata = {
  title: {
    template: "%s — VeTwo | Open-Source VetTech",
    default: "VeTwo — Open-Source Solutions for Animal Healthcare",
  },
  description:
    "Revolutionizing Veterinary care through Engineering & Code. Open-source veterinary technology, scientific software, and developer tools.",
  metadataBase: new URL("https://vetwo.dev"),
  alternates: {
    canonical: "https://vetwo.dev/en",
  },
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    siteName: "VeTwo",
    title: "VeTwo — Open-Source Solutions for Animal Healthcare",
    description:
      "Revolutionizing Veterinary care through Engineering & Code. Open-source VetTech, scientific tooling, and developer infrastructure.",
    url: "https://vetwo.dev/en",
    images: [{ url: "/icon.svg", alt: "VeTwo mark" }],
  },
};

// English fonts via next/font/google: fetched once at build time and
// self-hosted at runtime (no browser requests to Google). PNU stays fully
// local via tokens.css @font-face. Preload only PNU-Regular for AR;
// next/font preloads its own faces automatically.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const PNU_PRELOAD = "/fonts/PNU/PNU-Regular.ttf";

// Applies the stored/system theme before first paint so light/dark never
// flashes. Kept tiny and nonce-approved (CSP has no 'unsafe-inline').
const THEME_INIT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){}})();`;

const GITHUB_URL = "https://github.com/VeTwo-dev";
const NPM_URL = "https://www.npmjs.com/~vetwo.dev";

/** Destinations offered by the command palette. */
function paletteItems(locale: Locale): PaletteItem[] {
  const t = getDict(locale);
  return [
    { id: "home", group: "go", label: t.nav.home, href: `/${locale}` },
    { id: "services", group: "go", label: t.nav.services, href: `/${locale}/services` },
    { id: "projects", group: "go", label: t.nav.projects, href: `/${locale}#projects` },
    { id: "about", group: "go", label: t.nav.about, href: `/${locale}/about` },
    { id: "blog", group: "go", label: t.nav.blog, href: `/${locale}/blog` },
    { id: "ecosystem", group: "go", label: t.nav.ecosystem, href: `/${locale}#ecosystem` },
    { id: "engineering", group: "go", label: t.nav.engineering, href: `/${locale}#engineering` },
    {
      id: "github",
      group: "actions",
      label: t.paletteActions.github,
      hint: "github.com/VeTwo-dev",
      href: GITHUB_URL,
      external: true,
    },
    {
      id: "npm",
      group: "actions",
      label: t.paletteActions.npm,
      hint: "npmjs.com",
      href: NPM_URL,
      external: true,
    },
    {
      id: "theme",
      group: "actions",
      label: t.paletteActions.theme,
      hint: t.common.themeToggle,
      href: `/${locale}`,
      action: "toggle-theme",
    },
  ];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang={locale} dir={dirOf(locale)} className={`${inter.variable} ${robotoMono.variable}`} suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {locale === "ar" ? (
          <link
            rel="preload"
            href={PNU_PRELOAD}
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body dir={dirOf(locale)}>
        <SmoothScrollProvider>
          <Header locale={locale} />
          <main id="content"><PageTransition>{children}</PageTransition></main>
          <Footer locale={locale} />
          <CommandPalette locale={locale} items={paletteItems(locale)} />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
