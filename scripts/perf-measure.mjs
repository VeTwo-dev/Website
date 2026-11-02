/**
 * Lab performance measurement for representative routes.
 * Usage: bun scripts/perf-measure.mjs <label> [baseUrl]
 * Writes one JSON file per route under .agent/reports/perf/<label>/.
 *
 * Real browser measurement only (Puppeteer + CDP + PerformanceObserver):
 * - TTFB / FCP / LCP / CLS from Navigation, Paint, LCP and layout-shift observers.
 * - INP proxy: highest event-timing duration during a scripted interaction.
 * - Transfer sizes from resource-timing entries (JS, total).
 * - Console errors and page errors.
 *
 * Conditions: local production server, desktop 1440x900, cold navigation cache,
 * default network conditions. Lab numbers, not field data.
 */
import puppeteer from "puppeteer";
import { mkdir, writeFile } from "node:fs/promises";

const label = process.argv[2] ?? "run";
const base = process.argv[3] ?? "http://localhost:3001";
const outDir = `.agent/reports/perf/${label}`;

const ROUTES = [
  ["home-en", "/en"],
  ["home-ar", "/ar"],
  ["services-en", "/en/services"],
  ["services-ar", "/ar/services"],
  ["about-en", "/en/about"],
  ["about-ar", "/ar/about"],
  ["blog-en", "/en/blog"],
  ["blog-ar", "/ar/blog"],
  ["article-en", null], // filled below
];

const OBSERVER_SETUP = () => {
  window.__perf = { lcp: 0, lcpEl: "", cls: 0, fcp: 0, maxEvent: 0, longTasks: 0 };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__perf.fcp = e.startTime;
      }
    }).observe({ type: "paint", buffered: true });
    new PerformanceObserver((list) => {
      const last = list.getEntries().pop();
      if (last) {
        window.__perf.lcp = last.startTime;
        window.__perf.lcpEl =
          (last.element && last.element.tagName) || "(no element)";
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    let cur = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        // layout-shift entries without recent input (true CLS)
        if (!e.hadRecentInput) {
          cur += e.value;
          window.__perf.cls = cur;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.name === "longtask") window.__perf.longTasks += 1;
      }
    }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.duration > window.__perf.maxEvent) window.__perf.maxEvent = e.duration;
      }
    }).observe({ type: "event", buffered: true });
  } catch {
    /* observers unsupported: route recorded with partial data */
  }
};

const browser = await puppeteer.launch({ args: ["--font-render-hinting=none"] });

// discover one real article route
{
  const page = await browser.newPage();
  await page.goto(`${base}/en/blog`, { waitUntil: "networkidle2", timeout: 60000 });
  const href = await page.evaluate(() => {
    const a = document.querySelector('main a[href*="/blog/"]');
    return a ? new URL(a.href).pathname : null;
  });
  if (href) ROUTES[ROUTES.length - 1][1] = href;
  await page.close();
}

await mkdir(outDir, { recursive: true });
const summary = [];

for (const [name, route] of ROUTES) {
  if (!route) continue;
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 200)));
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(OBSERVER_SETUP);
  const client = await page.createCDPSession();
  await client.send("Network.enable");
  await client.send("Network.setCacheDisabled", { cacheDisabled: true });

  const t0 = Date.now();
  const response = await page.goto(`${base}${route}`, {
    waitUntil: "networkidle2",
    timeout: 90000,
  });

  // settle for hydration/animation, then perform a real interaction (theme cycle)
  await new Promise((r) => setTimeout(r, 2500));
  const interact = await page
    .evaluate(() => {
      const btn = document.querySelector('button[aria-pressed]');
      if (btn) btn.click();
      return Boolean(btn);
    })
    .catch(() => false);
  await new Promise((r) => setTimeout(r, 800));

  const res = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    let jsBytes = 0;
    let totalBytes = 0;
    for (const r of resources) {
      totalBytes += r.transferSize || 0;
      if (r.initiatorType === "script" || r.name.endsWith(".js")) {
        jsBytes += r.transferSize || 0;
      }
    }
    return {
      ttfb: nav ? nav.responseStart - nav.requestStart : null,
      domContentLoaded: nav ? nav.domContentLoadedEventEnd : null,
      resources: resources.length,
      jsBytes,
      totalBytes,
      ...window.__perf,
    };
  });

  const record = {
    route,
    name,
    status: response?.status() ?? null,
    ...res,
    interactionFired: interact,
    consoleErrors: errors,
    msWallClock: Date.now() - t0,
    conditions: { server: base, viewport: "1440x900", cache: "disabled" },
    measuredAt: new Date().toISOString(),
  };
  await writeFile(`${outDir}/${name}.json`, JSON.stringify(record, null, 2));
  summary.push(record);
  await page.close();
}

await browser.close();
await writeFile(
  `${outDir}/summary.json`,
  JSON.stringify(summary, null, 2)
);
console.table(
  summary.map((r) => ({
    route: r.route,
    ttfb: Math.round(r.ttfb ?? -1),
    fcp: Math.round(r.fcp ?? -1),
    lcp: Math.round(r.lcp ?? -1),
    cls: r.cls?.toFixed(3),
    maxEvent: Math.round(r.maxEvent ?? -1),
    longTasks: r.longTasks,
    jsKB: Math.round((r.jsBytes ?? 0) / 1024),
    totalKB: Math.round((r.totalBytes ?? 0) / 1024),
    errors: r.consoleErrors.length,
  }))
);
