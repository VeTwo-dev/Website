import { describe, expect, it } from "vitest";
import { ARTICLES } from "@/lib/docs/content";
import { articleDescription, articleJsonLd, serializeJsonLd } from "./jsonld";

const article = ARTICLES[0];

describe("articleDescription", () => {
  it("uses the real first paragraph for English, never the bare title", () => {
    const first = article.body.find((b) => b.type === "p");
    expect(articleDescription(article, "en")).toBe(
      first && first.type === "p" ? first.text : article.title,
    );
    expect(articleDescription(article, "en")).not.toBe(article.title);
  });

  it("uses the Arabic summary for Arabic", () => {
    expect(articleDescription(article, "ar")).toBe(article.summaryAr);
  });
});

describe("articleJsonLd", () => {
  it("builds a BlogPosting with the catalog's reviewed date only", () => {
    const ld = articleJsonLd(article, "en");
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe(article.title);
    expect(ld.url).toBe(`https://vetwo.dev/en/blog/${article.slug}`);
    expect(ld.dateModified).toBe(article.reviewed);
    expect(ld.inLanguage).toBe("en");
    expect("datePublished" in ld).toBe(false);
    expect("author" in ld).toBe(false);
  });

  it("localizes headline and URL for Arabic", () => {
    const ld = articleJsonLd(article, "ar");
    expect(ld.headline).toBe(article.titleAr);
    expect(ld.url).toBe(`https://vetwo.dev/ar/blog/${article.slug}`);
    expect(ld.inLanguage).toBe("ar");
  });

  it("serializes without letting content close the script tag", () => {
    const json = serializeJsonLd({
      "@type": "BlogPosting",
      headline: "</script><script>alert(1)</script>",
    });
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json).headline).toContain("</script>");
  });
});
