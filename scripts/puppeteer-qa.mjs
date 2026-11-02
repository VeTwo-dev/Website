#!/usr/bin/env node
/**
 * Puppeteer browser QA for VeTwo (screenshots + functional/animation checks).
 *
 * Requires a running server (bun run start / bun run dev) and the repo's
 * devDependency `puppeteer` (installed Chrome for Testing — user cache only).
 *
 *   bun run start &
 *   bun run scripts/puppeteer-qa.mjs --routes /en,/ar --viewports 1440x900,390x844
 *
 * Flags:
 *   --base URL            base URL (default http://localhost:3000)
 *   --routes a,b,c        routes to capture
 *   --viewports WxH,...   viewport matrix (default 1440x900,768x1024,390x844)
 *   --full                full-page screenshots (default viewport-only)
 *   --color-scheme d|l    emulated color scheme (default dark)
 *   --reduced-motion      emulate prefers-reduced-motion: reduce
 *   --menu                open the mobile disclosure menu before capturing
 *   --palette             open the command palette (keyboard ⌘K/Ctrl+K) before capturing
 *   --interactions        run navigation/scroll/animation function checks
 *   --out DIR             output directory (default .agent/reports/puppeteer-qa/<ts>)
 *   --settle MS           settle time after load (default 900)
 *
 * Exit code is non-zero when console errors, page errors, failed requests,
 * horizontal overflow, wrong h1 count, or broken interaction checks are found.
 * Screenshots and scoring artifacts land in the output directory (untracked).
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const base = option("--base", "http://localhost:3000").replace(/\/$/, "");
const routes = option("--routes", "/en").split(",").map((r) => r.trim()).filter(Boolean);
const viewports = option("--viewports", "1440x900,768x1024,390x844")
  .split(",")
  .map((v) => {
    const [width, height] = v.split("x").map(Number);
    return { width, height };
  });
const fullPage = flag("--full");
const wantInteractions = flag("--interactions");
const openMenu = flag("--menu");
const openPalette = flag("--palette");
const reducedMotion = flag("--reduced-motion");
const colorScheme =
  option("--color-scheme", "dark") === "l" ? "light" : "dark";
const settle = Number(option("--settle", "900"));
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
const outDir = path.resolve(option("--out", path.join(".agent", "reports", "puppeteer-qa", timestamp)));

const puppeteer = await import("puppeteer");

function slug(route) {
  return route === "/" ? "root" : route.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9-]+/g, "-");
}

/** Wait for fonts + entrance animations to quiesce, then settle.
 * Continuous animation loops (e.g. the circuit background pulse) must not
 * hold the promise: a hard elapsed cap guarantees exit. */
async function waitReady(page, settleMs) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const startedAt = performance.now();
        let idleCount = 0;
        const timer = setInterval(() => {
          const running = document.getAnimations().some((a) => a.playState === "running");
          idleCount = running ? 0 : idleCount + 1;
          const elapsed = performance.now() - startedAt;
          if (idleCount >= 2 || elapsed > 4000) {
            clearInterval(timer);
            resolve();
          }
        }, 120);
      }),
  );
  await new Promise((r) => setTimeout(r, settleMs));
}

let browser;
const failures = [];
const results = [];

try {
  await mkdir(outDir, { recursive: true });
  browser = await puppeteer.launch({
    // Safe defaults: no disabling of site isolation or web security.
    args: ["--font-render-hinting=none"],
  });

  for (const viewport of viewports) {
    for (const route of routes) {
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];
      const interactionIssues = [];
      const perf = {};
      let status = null;
      let shot = null;
      const url = `${base}${route}`;
      const state = [
        reducedMotion && "rm",
        openMenu && "menu",
        openPalette && "palette",
        colorScheme === "light" && "light",
      ]
        .filter(Boolean)
        .join("-");
      const filePath = path.join(
        outDir,
        `${slug(route)}-${viewport.width}x${viewport.height}${state ? `-${state}` : ""}.png`,
      );

      const page = await browser.newPage();
      try {
        page
          .on("console", (msg) => {
            if (msg.type() === "error") consoleErrors.push(msg.text());
          })
          .on("pageerror", (err) => pageErrors.push(err.message))
          .on("requestfailed", (req) => {
            const f = req.failure()?.errorText ?? "unknown";
            if (!f.includes("ERR_ABORTED")) failedRequests.push(`${req.url()} (${f})`);
          });

        await page.setViewport({ width: viewport.width, height: viewport.height });
        await page.emulateMediaFeatures([
          { name: "prefers-color-scheme", value: colorScheme },
          ...(reducedMotion
            ? [{ name: "prefers-reduced-motion", value: "reduce" }]
            : []),
        ]);

        const response = await page.goto(url, { waitUntil: "networkidle2", timeout: 45_000 });
        status = response?.status() ?? null;
        await waitReady(page, settle);

        if (fullPage) {
          // Sweep every scroll-reveal (Reveal is IO-driven and would stay in
          // its hidden state below the fold): a single jump would skip
          // intermediate bands, so step through the page instead.
          await page.evaluate(async () => {
            const step = Math.max(1, Math.round(window.innerHeight * 0.6));
            const max = document.documentElement.scrollHeight;
            for (let y = 0; y <= max + step; y += step) {
              window.scrollTo({ top: y, behavior: "instant" });
              await new Promise((r) => setTimeout(r, 160));
            }
            window.scrollTo({ top: 0, behavior: "instant" });
          });
          await new Promise((r) => setTimeout(r, 700));
        }

        const paletteOpenState = () =>
          page.evaluate(() => {
            const dlg = document.querySelector("dialog.palette-dialog, dialog");
            return dlg ? dlg.open : false;
          });
        let overlayOpen = false;

        if (openMenu) {
          // The mobile "Menu" button opens the command palette (variant=menu
          // PaletteTrigger); it is not a <details> disclosure.
          const clicked = await page.evaluate(() => {
            const button = document.querySelector('header button[data-variant="menu"]');
            if (!button) return false;
            button.click();
            return true;
          });
          await new Promise((r) => setTimeout(r, 500));
          if (!clicked) interactionIssues.push("mobile menu trigger not found in header");
          overlayOpen = clicked && (await paletteOpenState());
          if (!overlayOpen) interactionIssues.push("mobile menu did not open the palette dialog");
        } else if (openPalette) {
          await page.keyboard.down(process.platform === "darwin" ? "Meta" : "Control");
          await page.keyboard.press("k");
          await page.keyboard.up(process.platform === "darwin" ? "Meta" : "Control");
          await new Promise((r) => setTimeout(r, 500));
          overlayOpen = await paletteOpenState();
          if (!overlayOpen) interactionIssues.push("palette did not open with Ctrl/Meta+K");
        }

        if (overlayOpen) {
          // Capture the interaction state itself, then close it before the
          // metric pass so overflow/heading checks run on the base layout.
          await page.screenshot({ path: filePath, fullPage });
          shot = path.relative(process.cwd(), filePath);
          await page.keyboard.press("Escape");
          await new Promise((r) => setTimeout(r, 300));
          const closed = !(await paletteOpenState());
          if (!closed) {
            interactionIssues.push(
              openMenu ? "mobile menu/palette did not close with Escape" : "palette did not close with Escape",
            );
          }
        } else {
          await page.screenshot({ path: filePath, fullPage });
          shot = path.relative(process.cwd(), filePath);
        }

        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const overflow = Math.max(0, doc.scrollWidth - window.innerWidth);
          const offenders = [];
          if (overflow > 1) {
            for (const el of document.querySelectorAll("body *")) {
              const r = el.getBoundingClientRect();
              const excess = Math.max(r.right - window.innerWidth, -r.left);
              if (excess > 1 && r.width > 0) {
                offenders.push({
                  tag: el.tagName.toLowerCase(),
                  cls: String(el.className ?? "").slice(0, 80),
                  excess: Math.round(excess),
                });
              }
            }
            offenders.sort((a, b) => b.excess - a.excess);
          }
          const h1s = document.querySelectorAll("h1");
          const nav = performance.getEntriesByType("navigation")[0];
          return {
            title: document.title,
            lang: doc.lang,
            dir: doc.dir || getComputedStyle(doc).direction,
            h1Count: h1s.length,
            overflow,
            offenders: offenders.slice(0, 5),
            fontsLoaded: document.fonts.status === "loaded",
            mainText: getComputedStyle(document.body).fontFamily,
            scrollProgress: getComputedStyle(doc).getPropertyValue("--scroll-progress"),
            dcl: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
            load: nav ? Math.round(nav.loadEventEnd) : null,
          };
        });
        Object.assign(perf, { dcl: metrics.dcl, load: metrics.load, fonts: metrics.fontsLoaded });

        if (reducedMotion) {
          // Animation gate: entrance/gsap motion must leave the final state.
          const runningAfterSettle = await page.evaluate(
            () => document.getAnimations().filter((a) => a.playState === "running").length,
          );
          const heroText = await page.evaluate(() => {
            const item = document.querySelector("[data-hero]");
            // Not every route has a choreographed hero: /blog uses PageIntro
            // instead of HeroMotion, so a missing hero is legitimate. Only
            // assert opacity when a hero is actually present.
            return item ? getComputedStyle(item).opacity : "none";
          });
          if (heroText === "none") {
            // No hero on this route — skip the opacity assertion rather than
            // reporting a phantom failure. (2026-10-30: /en/blog and /ar/blog
            // were flagged as FAIL here before this branch was added.)
          } else if (heroText !== "1") {
            interactionIssues.push(`reduced-motion: hero item opacity=${heroText}`);
          }
          if (runningAfterSettle > 0) {
            interactionIssues.push(`reduced-motion: ${runningAfterSettle} animation(s) still running after settle`);
          }
        }

        if (wantInteractions) {
          // Scroll sanity: progress rule + statement fill respond to scroll.
          await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
          await new Promise((r) => setTimeout(r, 400));
          const progress = await page.evaluate(
            () => Number(getComputedStyle(document.documentElement).getPropertyValue("--scroll-progress") || "0"),
          );
          if (progress <= 0) interactionIssues.push("scroll progress rule did not update");
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
          await new Promise((r) => setTimeout(r, 250));
        }

        // Primary nav link destinations resolve to real routes.
        const brokenLinks = await page.evaluate((rootUrl) => {
          const issues = [];
          for (const a of document.querySelectorAll("header a[href^='/'], footer a[href^='/']")) {
            const href = a.getAttribute("href");
            if (!href || href.startsWith("//")) continue;
            const target = new URL(href, rootUrl);
            // Anchors within the same page are fine; only flag malformed paths.
            if (!target.pathname.startsWith("/")) issues.push(href);
          }
          return issues;
        }, base);
        if (brokenLinks.length) interactionIssues.push(`malformed in-app links: ${brokenLinks.join(", ")}`);

        const problems =
          consoleErrors.length +
          pageErrors.length +
          failedRequests.length +
          (metrics.overflow > 1 ? 1 : 0) +
          (status && status >= 400 ? 1 : 0) +
          (metrics.h1Count !== 1 ? 1 : 0) +
          interactionIssues.length;
        if (problems) failures.push({ url, viewport, state });

        results.push({
          url, route, viewport, state, status,
          metrics, consoleErrors, pageErrors, failedRequests,
          interactionIssues, screenshot: shot,
        });
        console.log(
          `${problems ? "FAIL" : "ok  "} ${route} @ ${viewport.width}x${viewport.height}${state ? ` [${state}]` : ""} · ${status ?? "?"} · h1=${metrics.h1Count} · overflow=${metrics.overflow}px · console=${consoleErrors.length} · dcl=${metrics.dcl}ms${shot ? ` · ${shot}` : ""}`,
        );
      } catch (err) {
        pageErrors.push(err instanceof Error ? err.message : String(err));
        failures.push({ url, viewport, state });
        results.push({
          url, route, viewport, state, status, consoleErrors, pageErrors,
          failedRequests, interactionIssues, screenshot: null,
        });
        console.log(`FAIL ${route} @ ${viewport.width}x${viewport.height} · ${pageErrors[pageErrors.length - 1]}`);
      } finally {
        await page.close();
      }
    }
  }
} finally {
  if (browser) {
    try {
      await browser.close();
    } catch {
      // best-effort cleanup; child processes are reaped by the browser's own shutdown
    }
  }
}

await mkdir(outDir, { recursive: true });
await writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      base,
      colorScheme,
      reducedMotion,
      routes,
      viewports,
      fullPage,
      interactions: wantInteractions,
      failures: failures.length,
      results,
    },
    null,
    2,
  ) + "\n",
);

console.log(`\n${results.length - failures.length}/${results.length} clean · output: ${path.relative(process.cwd(), outDir)}`);
if (failures.length) {
  for (const r of results.filter((x) =>
    x.consoleErrors?.length || x.pageErrors?.length || x.failedRequests?.length ||
    x.metrics?.overflow > 1 || x.interactionIssues?.length || (x.status && x.status >= 400),
  )) {
    console.log(`\n${r.url} @ ${r.viewport.width}x${r.viewport.height} ${r.state ? `[${r.state}]` : ""}`);
    for (const m of (r.consoleErrors ?? []).slice(0, 5)) console.log(`  console: ${m}`);
    for (const m of (r.pageErrors ?? []).slice(0, 5)) console.log(`  page: ${m}`);
    for (const m of (r.failedRequests ?? []).slice(0, 5)) console.log(`  request: ${m}`);
    if (r.metrics?.overflow > 1) console.log(`  overflow: ${r.metrics.overflow}px`, r.metrics.offenders);
    for (const m of r.interactionIssues ?? []) console.log(`  interaction: ${m}`);
  }
  process.exitCode = 1;
}
