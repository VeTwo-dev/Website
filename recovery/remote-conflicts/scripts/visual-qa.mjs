#!/usr/bin/env node
/**
 * Visual QA capture + smoke checks for VeTwo.
 *
 * Requires a running server and Playwright (not a project dependency):
 *   bun run dev            # or: bun run build && bun run start
 *   bun run visual:qa --routes /en,/ar --viewports 1440x900,768x1024,390x844
 *
 * Playwright resolution order:
 *   1. PLAYWRIGHT_MODULE=/abs/path/to/node_modules/playwright
 *   2. local `playwright` dependency
 *   3. `playwright-core`
 *
 * Optional: --axe (needs @axe-core/playwright), --full (full-page), --out <dir>,
 *           --base <url>, --color-scheme dark|light, --settle <ms>.
 *
 * Exit code is non-zero when console errors, page errors, failed requests,
 * horizontal overflow, or (with --axe) violations are found.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const base = option("--base", "http://localhost:3000").replace(/\/$/, "");
const routes = option("--routes", "/en,/ar").split(",").map((r) => r.trim()).filter(Boolean);
const viewports = option("--viewports", "1440x900,768x1024,390x844")
  .split(",")
  .map((v) => {
    const [width, height] = v.split("x").map(Number);
    return { width, height };
  });
const useAxe = flag("--axe");
const fullPage = flag("--full");
const settle = Number(option("--settle", "600"));
const colorScheme = option("--color-scheme", "dark");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
const outDir = path.resolve(option("--out", path.join(".agent", "reports", "visual-qa", timestamp)));

const HARNESS = path.resolve(".agent/qa-harness/node_modules");

async function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_MODULE,
    path.join(HARNESS, "playwright"),
    "playwright",
    "playwright-core",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const specifier = candidate.startsWith("/") || candidate.startsWith(".")
        ? pathToFileURL(candidate).href
        : candidate;
      return await import(specifier);
    } catch {
      // try next
    }
  }
  return null;
}

async function loadAxe() {
  const require = createRequire(path.join(process.cwd(), "package.json"));
  const searchPaths = [process.cwd(), HARNESS];
  if (process.env.PLAYWRIGHT_MODULE) {
    searchPaths.push(path.dirname(path.dirname(process.env.PLAYWRIGHT_MODULE)));
  }
  try {
    const resolved = require.resolve("@axe-core/playwright", { paths: searchPaths });
    const mod = await import(pathToFileURL(resolved).href);
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

function slug(route) {
  return route === "/" ? "root" : route.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9-]+/g, "-");
}

async function checkServer() {
  try {
    const res = await fetch(base, { redirect: "manual" });
    return res.status < 500;
  } catch {
    return false;
  }
}

const playwright = await loadPlaywright();
if (!playwright) {
  console.error(
    "Playwright is not available.\n" +
      "Install it in the project-local harness, e.g.:\n" +
      "  cd .agent/qa-harness && bun add playwright @axe-core/playwright\n" +
      "Or set PLAYWRIGHT_MODULE=/abs/path/to/node_modules/playwright. No files were written."
  );
  process.exit(2);
}

const axe = useAxe ? await loadAxe() : null;
if (useAxe && !axe) {
  console.warn("@axe-core/playwright not found; skipping axe checks.");
}

if (!(await checkServer())) {
  console.error(`No server reachable at ${base}. Start it first (bun run dev or bun run start).`);
  process.exit(2);
}

await mkdir(outDir, { recursive: true });
const browser = await playwright.chromium.launch();
const results = [];
let failures = 0;

for (const viewport of viewports) {
  for (const route of routes) {
    const context = await browser.newContext({ viewport, colorScheme });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("requestfailed", (req) => {
      const failure = req.failure()?.errorText ?? "unknown";
      if (!failure.includes("ERR_ABORTED")) failedRequests.push(`${req.url()} (${failure})`);
    });

    const url = `${base}${route}`;
    let status = null;
    let metrics = {};
    let axeViolations = [];
    let shot = null;
    try {
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
      status = response?.status() ?? null;
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(settle);

      // Capture the top-of-page viewport before the reveal sweep: stale
      // compositor tiles from the scroll can ghost webfont text.
      const file = `${slug(route)}-${viewport.width}x${viewport.height}.png`;
      if (fullPage) {
        await page.screenshot({ path: path.join(outDir, file), fullPage });
      } else {
        const cdp = await page.context().newCDPSession(page);
        const { data } = await cdp.send("Page.captureScreenshot", {
          format: "png",
          fromSurface: true,
          captureBeyondViewport: false,
        });
        await cdp.detach();
        await writeFile(path.join(outDir, file), Buffer.from(data, "base64"));
      }
      shot = file;

      // Trigger every scroll reveal, return to the top, and let animations
      // finish — measuring mid-transition produces false contrast failures.
      await page.evaluate(async () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
        await new Promise((resolve) => setTimeout(resolve, 250));
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      await page.waitForTimeout(settle);
      await page.evaluate(async () => {
        const animations = document.getAnimations().filter((animation) => {
          const timing = animation.effect && "getTiming" in animation.effect ? animation.effect.getTiming() : null;
          return timing ? timing.iterations !== Infinity : false;
        });
        await Promise.race([
          Promise.all(animations.map((animation) => animation.finished.catch(() => undefined))),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      });

      metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const overflow = Math.max(0, doc.scrollWidth - window.innerWidth);
        const offenders = [];
        if (overflow > 1) {
          for (const el of Array.from(document.querySelectorAll("body *"))) {
            const r = el.getBoundingClientRect();
            const excess = Math.max(r.right - window.innerWidth, -r.left);
            if (excess > 1 && r.width > 0) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                className: typeof el.className === "string" ? el.className.slice(0, 80) : "",
                excess: Math.round(excess),
              });
            }
          }
          offenders.sort((a, b) => b.excess - a.excess);
        }
        const headings = Array.from(document.querySelectorAll("h1")).map((h) => h.textContent?.trim() ?? "");
        return {
          title: document.title,
          lang: doc.lang,
          dir: doc.dir || getComputedStyle(doc).direction,
          h1Count: headings.length,
          h1: headings,
          scrollWidth: doc.scrollWidth,
          innerWidth: window.innerWidth,
          overflow,
          offenders: offenders.slice(0, 5),
          bodyFontSize: getComputedStyle(document.body).fontSize,
        };
      });

      if (axe) {
        const builder = new axe({ page });
        const report = await builder.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        axeViolations = report.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
          help: v.help,
        }));
      }

    } catch (error) {
      pageErrors.push(error instanceof Error ? error.message : String(error));
    }

    const problems = consoleErrors.length + pageErrors.length + failedRequests.length + (metrics.overflow > 1 ? 1 : 0) + axeViolations.length + (status && status >= 400 ? 1 : 0);
    if (problems) failures += 1;

    results.push({
      url,
      route,
      viewport,
      colorScheme,
      status,
      metrics,
      consoleErrors,
      pageErrors,
      failedRequests,
      axeViolations,
      screenshot: shot,
    });
    console.log(
      `${problems ? "FAIL" : "ok  "} ${route} @ ${viewport.width}x${viewport.height} · ${status ?? "?"} · h1=${metrics.h1Count ?? "?"} · overflow=${metrics.overflow ?? "?"}px · console=${consoleErrors.length} · axe=${axeViolations.length}${shot ? ` · ${shot}` : ""}`
    );
    await context.close();
  }
}

await browser.close();

const manifest = {
  capturedAt: new Date().toISOString(),
  base,
  routes,
  viewports,
  colorScheme,
  fullPage,
  axe: Boolean(axe),
  failures,
  results,
};
await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`\n${results.length - failures}/${results.length} clean · output: ${outDir}`);
if (failures) {
  for (const r of results.filter((x) => x.consoleErrors.length || x.pageErrors.length || x.failedRequests.length || x.axeViolations.length || x.metrics.overflow > 1)) {
    console.log(`\n${r.url} @ ${r.viewport.width}x${r.viewport.height}`);
    for (const msg of r.consoleErrors.slice(0, 5)) console.log(`  console: ${msg}`);
    for (const msg of r.pageErrors.slice(0, 5)) console.log(`  page: ${msg}`);
    for (const msg of r.failedRequests.slice(0, 5)) console.log(`  request: ${msg}`);
    if (r.metrics.overflow > 1) console.log(`  overflow: ${r.metrics.overflow}px`, r.metrics.offenders);
    for (const v of r.axeViolations.slice(0, 5)) console.log(`  axe ${v.id} (${v.impact}) x${v.nodes}: ${v.help}`);
  }
  process.exitCode = 1;
}
