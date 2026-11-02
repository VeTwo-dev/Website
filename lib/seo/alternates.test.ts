import { describe, expect, it } from "vitest";
import { localeAlternates } from "./alternates";

describe("localeAlternates", () => {
  it("emits canonical + en/ar/x-default for a page path", () => {
    expect(localeAlternates("/projects/units")).toEqual({
      canonical: "https://vetwo.dev/en/projects/units",
      languages: {
        en: "https://vetwo.dev/en/projects/units",
        ar: "https://vetwo.dev/ar/projects/units",
        "x-default": "https://vetwo.dev/en/projects/units",
      },
    });
  });
  it("handles the home path without a trailing slash", () => {
    const a = localeAlternates("");
    expect(a.canonical).toBe("https://vetwo.dev/en");
    expect(a.languages.ar).toBe("https://vetwo.dev/ar");
  });
});
