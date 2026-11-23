import { describe, expect, it } from "vitest";
import { localeAlternates } from "./alternates";

describe("localeAlternates", () => {
  it("emits a self-referencing canonical plus en/ar/x-default for a page path", () => {
    expect(localeAlternates("/projects/units", "en")).toEqual({
      canonical: "https://vetwo.dev/en/projects/units",
      languages: {
        en: "https://vetwo.dev/en/projects/units",
        ar: "https://vetwo.dev/ar/projects/units",
        "x-default": "https://vetwo.dev/en/projects/units",
      },
    });
  });

  it("canonicals Arabic pages to their own Arabic URL", () => {
    const a = localeAlternates("/blog", "ar");
    expect(a.canonical).toBe("https://vetwo.dev/ar/blog");
    expect(a.languages.ar).toBe("https://vetwo.dev/ar/blog");
    expect(a.canonical).not.toBe(a.languages.en);
  });

  it("keeps alternate sets reciprocal across locales", () => {
    const en = localeAlternates("/about", "en");
    const ar = localeAlternates("/about", "ar");
    expect(en.languages).toEqual(ar.languages);
    expect(en.canonical).toBe(en.languages.en);
    expect(ar.canonical).toBe(ar.languages.ar);
    expect(en.languages["x-default"]).toBe(en.canonical);
  });

  it("handles the home path without a trailing slash", () => {
    const a = localeAlternates("", "ar");
    expect(a.canonical).toBe("https://vetwo.dev/ar");
    expect(a.languages.en).toBe("https://vetwo.dev/en");
    expect(a.languages["x-default"]).toBe("https://vetwo.dev/en");
  });

  it("accepts paths without a leading slash", () => {
    expect(localeAlternates("services", "ar").canonical).toBe(
      "https://vetwo.dev/ar/services",
    );
  });
});
