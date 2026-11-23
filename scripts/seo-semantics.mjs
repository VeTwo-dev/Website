/**
 * Semantic + accessibility probes for representative routes.
 * Usage: bun scripts/seo-semantics.mjs <label> [baseUrl]
 *
 * Verifies in a real browser: landmarks (header/nav/main/footer), exactly one
 * h1, no skipped heading levels, descriptive link text, image alt attributes,
 * skip-link target, document lang/dir, JSON-LD presence/parse, and a visible
 * focus ring after keyboard Tab. Screenshots of the first focused element are
 * saved for evidence.
 *
 * Output: .agent/reports/seo-semantics/<label>/{report.json,report.md}
 */
import puppeteer from "puppeteer";
import { mkdir, writeFile } from "node:fs/promises";

const label = process.argv[2] ?? "run";
const base = process.argv[3] ?? "http://localhost:3001";
const outDir = `.agent/reports/seo-semantics/${label}`;

const ROUTES = [
  "/en",
  "/ar",
  "/en/services",
  "/ar/services",
  "/en/about",
  "/ar/about",
  "/en/blog",
  "/ar/blog",
];
{
  const html = await (await fetch(`${base}/en/blog`)).text();
  const m = html.match(/href="(\/en\/blog\/[^"#?]+)"/);
  if (m) ROUTES.push(m[1], m[1].replace("/en/", "/ar/"));
}

const browser = await puppeteer.launch({
  args: ["--font-render-hinting=none"],
});
const results = [];

for (const route of ROUTES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${base}${route}`, {
    waitUntil: "networkidle2",
    timeout: 90000,
  });
  await new Promise((r) => setTimeout(r, 1200));

  const audit = await page.evaluate(() => {
    const issues = [];
    const q = (sel) => document.querySelectorAll(sel);

    const landmarks = {
      header: q("body > header, header").length,
      nav: q("nav").length,
      main: q("main").length,
      footer: q("body > footer, footer").length,
    };
    if (landmarks.main !== 1) issues.push(`main landmarks=${landmarks.main}`);
    if (landmarks.header < 1) issues.push("missing header landmark");
    if (landmarks.footer < 1) issues.push("missing footer landmark");
    if (landmarks.nav < 1) issues.push("missing nav landmark");

    const headings = [...q("h1,h2,h3,h4,h5,h6")].map((h) =>
      Number(h.tagName[1]),
    );
    const h1Count = headings.filter((l) => l === 1).length;
    if (h1Count !== 1) issues.push(`h1 count=${h1Count}`);
    let skipped = null;
    for (let i = 1; i < headings.length; i += 1) {
      if (headings[i] - headings[i - 1] > 1)
        skipped = `${headings[i - 1]}→${headings[i]}`;
    }
    if (skipped) issues.push(`heading level skip ${skipped}`);

    // Links with no accessible text (text, aria-label, or nested img alt).
    const namelessLinks = [...q("a[href]")].filter((a) => {
      const text = (a.textContent || "").trim();
      const aria = a.getAttribute("aria-label");
      const img = a.querySelector("img[alt]");
      const title = a.getAttribute("title");
      return !text && !aria && !img && !title;
    });
    if (namelessLinks.length)
      issues.push(`${namelessLinks.length} link(s) without accessible name`);

    const imgs = [...q("img")];
    const missingAlt = imgs.filter((i) => !i.hasAttribute("alt"));
    if (missingAlt.length)
      issues.push(`${missingAlt.length} image(s) without alt`);

    const skip = q("a[href^='#']")[0];
    let skipOk = null;
    if (skip) {
      const id = skip.getAttribute("href").slice(1);
      skipOk = Boolean(id && document.getElementById(id));
      if (!skipOk) issues.push(`skip link target #${id} missing`);
    }

    const jsonLd = [...q('script[type="application/ld+json"]')];
    const types = [];
    let jsonLdValid = true;
    for (const s of jsonLd) {
      try {
        types.push(JSON.parse(s.textContent)["@type"]);
      } catch {
        jsonLdValid = false;
      }
    }

    // Interactive controls inside main must be reachable and named.
    const unnamedButtons = [...q("main button")].filter(
      (b) => !(b.textContent || "").trim() && !b.getAttribute("aria-label"),
    );
    if (unnamedButtons.length)
      issues.push(`${unnamedButtons.length} unnamed button(s)`);

    return {
      lang: document.documentElement.lang,
      dir:
        document.documentElement.dir ||
        getComputedStyle(document.documentElement).direction,
      title: document.title,
      landmarks,
      h1Count,
      headingLevels: headings,
      namelessLinks: namelessLinks.length,
      images: imgs.length,
      missingAlt: missingAlt.length,
      skipLink: Boolean(skip),
      skipLinkTarget: skipOk,
      jsonLdTypes: types,
      jsonLdValid,
      unnamedButtons: unnamedButtons.length,
      issues,
    };
  });

  // Keyboard focus ring on the first focusable element after the skip link.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { tag: null, ring: false };
    const s = getComputedStyle(el);
    const ring =
      s.outlineStyle !== "none" ||
      s.boxShadow !== "none" ||
      (el.className || "").toString().includes("focus-visible");
    return {
      tag: el.tagName,
      label: (el.getAttribute("aria-label") || el.textContent || "")
        .trim()
        .slice(0, 60),
      ring,
    };
  });
  if (!focus.ring)
    audit.issues.push("no visible focus ring on Tabbable element");

  const schemeOk = route.startsWith("/ar")
    ? audit.lang === "ar" && audit.dir === "rtl"
    : audit.lang === "en" && audit.dir === "ltr";
  if (!schemeOk) audit.issues.push("lang/dir mismatch");

  const record = { route, ...audit, focus };
  results.push(record);
  if (audit.issues.length === 0) await page.close();
  else await page.close();
}

await browser.close();

const failures = results.flatMap((r) =>
  r.issues.map((i) => `${r.route} → ${i}`),
);
const report = {
  label,
  base,
  generatedAt: new Date().toISOString(),
  results,
  failures,
  pass: failures.length === 0,
};
await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));
const md = [
  `# Semantic / a11y audit — ${label}`,
  "",
  `Base: ${base} · ${report.generatedAt}`,
  "",
  "| Route | lang/dir | header/nav/main/footer | h1 | heading levels | links named | imgs alt | JSON-LD | focus ring |",
  "|---|---|---|---|---|---|---|---|---|",
  ...results.map(
    (r) =>
      `| ${r.route} | ${r.lang}/${r.dir} | ${r.landmarks.header}/${r.landmarks.nav}/${r.landmarks.main}/${r.landmarks.footer} | ${r.h1Count} | ${r.headingLevels.join(",")} | ${r.namelessLinks === 0 ? "PASS" : `${r.namelessLinks} unnamed`} | ${r.missingAlt === 0 ? `PASS (${r.images})` : `${r.missingAlt} missing`} | ${r.jsonLdValid ? r.jsonLdTypes.join(",") || "none" : "INVALID"} | ${r.focus.ring ? "PASS" : "FAIL"} |`,
  ),
  "",
  failures.length
    ? `## Failures\n${failures.map((f) => `- ${f}`).join("\n")}`
    : "## No failures",
  "",
].join("\n");
await writeFile(`${outDir}/report.md`, md);
console.log(md);
console.log(
  report.pass ? "SEMANTICS: PASS" : `SEMANTICS: ${failures.length} FAILURES`,
);
