import type { Metadata } from "next";
import { describe, expect, it } from "vitest";
import { OG_IMAGE, pageMetadata } from "./page-meta";

/** Next's OpenGraph/Twitter types are unions; read the fields we assert. */
const og = (m: Metadata) =>
  (m.openGraph ?? {}) as unknown as Record<string, unknown>;
const tw = (m: Metadata) =>
  (m.twitter ?? {}) as unknown as Record<string, unknown>;

describe("pageMetadata", () => {
  it("canonicals to the rendered locale and mirrors it in Open Graph", () => {
    const meta = pageMetadata({
      locale: "ar",
      path: "/services",
      title: "ما نبنيه",
      description: "وصف",
    });
    expect(meta.alternates?.canonical).toBe("https://vetwo.dev/ar/services");
    expect(og(meta).url).toBe("https://vetwo.dev/ar/services");
    expect(og(meta).locale).toBe("ar_AR");
    expect(og(meta).type).toBe("website");
    expect(tw(meta).card).toBe("summary_large_image");
  });

  it("keeps English self-canonical plus reciprocal hreflang", () => {
    const meta = pageMetadata({
      locale: "en",
      path: "/about",
      title: "About",
      description: "About VeTwo",
    });
    expect(meta.alternates).toEqual({
      canonical: "https://vetwo.dev/en/about",
      languages: {
        en: "https://vetwo.dev/en/about",
        ar: "https://vetwo.dev/ar/about",
        "x-default": "https://vetwo.dev/en/about",
      },
    });
    expect(og(meta).locale).toBe("en_US");
  });

  it("uses the absolute title when requested (home must not double-brand)", () => {
    const meta = pageMetadata({
      locale: "en",
      path: "",
      title: "VeTwo — Open-Source Solutions for Animal Healthcare",
      description: "…",
      absoluteTitle: true,
    });
    expect(meta.title).toEqual({
      absolute: "VeTwo — Open-Source Solutions for Animal Healthcare",
    });
    expect(meta.alternates?.canonical).toBe("https://vetwo.dev/en");
  });

  it("emits article type and modifiedTime only for articles", () => {
    const article = pageMetadata({
      locale: "en",
      path: "/blog/units",
      title: "Units",
      description: "Units",
      article: { modifiedTime: "2026-10-23" },
    });
    expect(og(article).type).toBe("article");
    expect(og(article).modifiedTime).toBe("2026-10-23");
    expect(og(article).images).toEqual([OG_IMAGE]);
  });

  it("shares one social card across every page", () => {
    const meta = pageMetadata({
      locale: "ar",
      path: "",
      title: "فيتو",
      description: "…",
    });
    expect(og(meta).images).toEqual([OG_IMAGE]);
    expect(tw(meta).images).toEqual([OG_IMAGE.url]);
  });
});
