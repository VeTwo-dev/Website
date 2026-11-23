/**
 * Rendered-HTML SEO validation for the deployed production server.
 * Usage: bun scripts/seo-validate.mjs <label> [baseUrl]
 *
 * Checks per representative route: HTTP status, title, meta description,
 * self-referencing canonical, en/ar/x-default hreflang pairs, robots meta,
 * html lang/dir, single h1, Open Graph + Twitter tags, JSON-LD parseability,
 * and image alt attributes. Then validates robots.txt, sitemap.xml (every URL
 * returns 200) and internal links on the home pages.
 *
 * Output: .agent/reports/seo-validation/<label>/report.{json,md}
 * External validators (Google Rich Results, Schema Markup Validator) are NOT
 * called; JSON-LD is validated locally as the report states.
 */
import { mkdir, writeFile } from "node:fs/promises";

const label = process.argv[2] ?? new Date().toISOString().replace(/[:.]/g, "-");
const base = process.argv[3] ?? "http://localhost:3001";
const outDir = `.agent/reports/seo-validation/${label}`;

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
// article route discovered from the blog listing
{
  const html = await (await fetch(`${base}/en/blog`)).text();
  const m = html.match(/href="(\/en\/blog\/[^"#?]+)"/);
  if (m) ROUTES.push(m[1], m[1].replace("/en/", "/ar/"));
}

const get = async (path) => {
  const res = await fetch(`${base}${path}`, { redirect: "manual" });
  return { status: res.status, html: await res.text(), headers: res.headers };
};

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return m ? m[1].replace(/&amp;/g, "&") : null;
};
const all = (html, re) =>
  [
    ...html.matchAll(
      new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`),
    ),
  ].map((m) => m[0]);

const decode = (s) =>
  s
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const results = [];
const canonicalSeen = new Map();

for (const route of ROUTES) {
  const { status, html } = await get(route);
  const checks = {};
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] ?? "");
  checks.status = status === 200;
  checks.title = title.length > 10;
  checks.titleLength = title.length;

  const descTag = all(html, /<meta name="description" content="[^"]*"/)[0];
  const description = descTag ? decode(attr(descTag, "content") ?? "") : "";
  checks.description = description.length >= 50;
  checks.descriptionLength = description.length;

  const canonicalTags = all(html, /<link rel="canonical" href="[^"]*"/);
  const canonical = canonicalTags[0] ? attr(canonicalTags[0], "href") : null;
  checks.singleCanonical = canonicalTags.length === 1;
  checks.selfCanonical = canonical === `https://vetwo.dev${route}`;
  if (canonical) canonicalSeen.set(route, canonical);

  const hreflangs = {};
  for (const tag of all(
    html,
    /<link rel="alternate" hrefLang="[^"]*" href="[^"]*"/i,
  )) {
    hreflangs[attr(tag, "hreflang")] = attr(tag, "href");
  }
  checks.hreflangSet =
    hreflangs.en === `https://vetwo.dev${route.replace(/^\/(en|ar)/, "/en")}` &&
    hreflangs.ar === `https://vetwo.dev${route.replace(/^\/(en|ar)/, "/ar")}` &&
    hreflangs["x-default"] === `${hreflangs.en}`;

  const robotsTag = all(html, /<meta name="robots" content="[^"]*"/)[0];
  checks.indexable =
    !robotsTag || !/noindex/.test(attr(robotsTag, "content") ?? "");

  const lang = (html.match(/<html[^>]*lang="([^"]*)"/) || [])[1];
  const dir = (html.match(/<html[^>]*dir="([^"]*)"/) || [])[1];
  checks.langDir = route.startsWith("/ar")
    ? lang === "ar" && dir === "rtl"
    : lang === "en" && dir === "ltr";

  checks.singleH1 = (html.match(/<h1[\s>]/g) || []).length === 1;

  const og = {};
  for (const tag of all(html, /<meta property="og:[^"]*" content="[^"]*"/)) {
    og[attr(tag, "property")] = decode(attr(tag, "content") ?? "");
  }
  checks.ogComplete = Boolean(
    og["og:title"] &&
    og["og:description"] &&
    og["og:image"] &&
    og["og:url"] &&
    og["og:locale"],
  );
  checks.ogUrlMatchesCanonical = og["og:url"] === canonical;
  checks.ogImage = og["og:image"] ?? null;

  const tw = {};
  for (const tag of all(html, /<meta name="twitter:[^"]*" content="[^"]*"/)) {
    tw[attr(tag, "name")] = decode(attr(tag, "content") ?? "");
  }
  checks.twitterCard = Boolean(
    tw["twitter:card"] && tw["twitter:title"] && tw["twitter:image"],
  );

  const jsonLdScripts = all(
    html,
    /<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/,
  );
  const types = [];
  let jsonLdValid = true;
  for (const block of jsonLdScripts) {
    try {
      const raw = block.replace(/^[\s\S]*?>/, "").replace(/<\/script>$/, "");
      const data = JSON.parse(raw);
      types.push(data["@type"]);
    } catch {
      jsonLdValid = false;
    }
  }
  checks.jsonLdValid = jsonLdValid;
  checks.jsonLdTypes = types;

  const imgTags = all(html, /<img\b[^>]*>/g);
  checks.imagesHaveAlt = imgTags.every((t) => /\salt="/.test(t));

  results.push({
    route,
    checks,
    title,
    description,
    canonical,
    hreflangs,
    og,
    twitter: tw,
  });
}

// robots.txt
const robotsRes = await fetch(`${base}/robots.txt`);
const robotsTxt = await robotsRes.text();
const robots = {
  status: robotsRes.status,
  allowsPublic:
    /User-Agent: \*/i.test(robotsTxt) && /Allow: \//i.test(robotsTxt),
  disallowsApi: /Disallow: \/api\//i.test(robotsTxt),
  disallowsLogin: /Disallow: \/login/i.test(robotsTxt),
  sitemap: /Sitemap: https:\/\/vetwo\.dev\/sitemap\.xml/i.test(robotsTxt),
};

// sitemap.xml
const smRes = await fetch(`${base}/sitemap.xml`);
const smXml = await smRes.text();
const smUrls = [...smXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const smStatuses = [];
for (const url of smUrls) {
  // Sitemap <loc>s are production absolute URLs; probe the same paths locally.
  const local = url.replace("https://vetwo.dev", base);
  const res = await fetch(local, { redirect: "manual" });
  smStatuses.push({ url, status: res.status });
}
const sitemap = {
  status: smRes.status,
  urls: smUrls.length,
  allResolve: smStatuses.every((s) => s.status === 200),
  broken: smStatuses.filter((s) => s.status !== 200),
  hasHreflang: /xhtml:link[^>]*hreflang="ar"/.test(smXml),
  hasArticles: smUrls.some((u) => /\/blog\/[^/]+$/.test(u)),
  excludesLogin: !smUrls.some((u) => u.includes("/login")),
};

// internal links from both home pages (sample)
const internal = [];
for (const home of ["/en", "/ar"]) {
  const { html } = await get(home);
  const hrefs = [...html.matchAll(/href="(\/[^"#?]*)"?/g)].map((m) => m[1]);
  for (const href of [...new Set(hrefs)].slice(0, 40)) {
    const res = await fetch(`${base}${href}`, { redirect: "manual" });
    internal.push({ from: home, href, status: res.status });
  }
}
const brokenLinks = internal.filter((l) => l.status >= 400);
const loginHtml = await (await fetch(`${base}/login`)).text();
const loginRobots = all(loginHtml, /<meta name="robots" content="[^"]*"/)[0];
const loginNoindex = Boolean(
  loginRobots && /noindex/.test(attr(loginRobots, "content") ?? ""),
);
const ogImageRes = await fetch(`${base}/og.png`);
const ogImageOk =
  ogImageRes.status === 200 &&
  (ogImageRes.headers.get("content-type") ?? "").includes("image/png");

const failures = [];
for (const r of results) {
  for (const [k, v] of Object.entries(r.checks)) {
    if (typeof v === "boolean" && !v) failures.push(`${r.route} → ${k}`);
  }
}
for (const [k, v] of Object.entries(robots)) {
  if (typeof v === "boolean" && !v) failures.push(`robots.txt → ${k}`);
}
for (const [k, v] of Object.entries(sitemap)) {
  if (typeof v === "boolean" && !v) failures.push(`sitemap.xml → ${k}`);
}
if (!loginNoindex) failures.push("/login → missing noindex");
if (!ogImageOk) failures.push("/og.png → unavailable");
if (brokenLinks.length)
  failures.push(`internal links → ${brokenLinks.length} broken`);

const report = {
  label,
  base,
  generatedAt: new Date().toISOString(),
  environment:
    "production build served by next start; desktop fetch, default headers",
  externalValidation:
    "not performed (no Google Rich Results / Schema Markup Validator call)",
  routes: results,
  robots,
  sitemap,
  loginNoindex,
  ogImage: {
    status: ogImageRes.status,
    contentType: ogImageRes.headers.get("content-type"),
  },
  internalLinksChecked: internal.length,
  brokenLinks,
  failures,
  pass: failures.length === 0,
};

await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));

const md = [
  `# SEO validation — ${label}`,
  "",
  `Base: ${base} · ${report.generatedAt}`,
  `External validators: not performed (local JSON-LD parse only)`,
  "",
  "| Route | Status | Title | Desc | Canonical | Hreflang | Indexable | Lang/Dir | H1 | OG | Twitter | JSON-LD |",
  "|---|---|---|---|---|---|---|---|---|---|---|---|",
  ...results.map((r) => {
    const c = r.checks;
    const ok = (v) => (v ? "PASS" : "**FAIL**");
    return `| ${r.route} | ${c.status ? 200 : "ERR"} | ${ok(c.title)} | ${ok(c.description)} | ${ok(c.selfCanonical)} | ${ok(c.hreflangSet)} | ${ok(c.indexable)} | ${ok(c.langDir)} | ${ok(c.singleH1)} | ${ok(c.ogComplete)} | ${ok(c.twitterCard)} | ${ok(c.jsonLdValid)} (${c.jsonLdTypes.join(", ") || "none"}) |`;
  }),
  "",
  `Robots: ${JSON.stringify(robots)}`,
  "",
  `Sitemap: ${JSON.stringify(sitemap)}`,
  "",
  `Login noindex: ${loginNoindex}`,
  "",
  `Broken internal links: ${brokenLinks.length}`,
  "",
  failures.length
    ? `## Failures\n${failures.map((f) => `- ${f}`).join("\n")}`
    : "## No failures",
  "",
].join("\n");
await writeFile(`${outDir}/report.md`, md);

console.log(md);
console.log(
  report.pass
    ? "SEO VALIDATION: PASS"
    : `SEO VALIDATION: ${failures.length} FAILURES`,
);
process.exit(report.pass ? 0 : 1);
