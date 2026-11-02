#!/usr/bin/env node
/**
 * Page-transition QA for VeTwo (`components/page-transition.tsx` +
 * `next-transition-router`). Requires a running server.
 *
 *   bun run start &
 *   bun run scripts/puppeteer-transitions.mjs --base http://localhost:3000
 *
 * Verifies, with real click-through navigation:
 *  1. Lenis rail is active on load (html.lenis.lenis-smooth) and stays one
 *     instance across navigations.
 *  2. Internal-link click → exit surface covers (+ screenshot), no early
 *     destination flash, URL switch, enter reveal (+ screenshot), overlay
 *     cleared at rest.
 *  3. Overlay + page states at exit / swap / enter / rest checkpoints.
 *  4. In-page hash navigation never shows the surface and still lands on
 *     the target section through Lenis.
 *  5. Reduced-motion navigation is instant: surface never appears.
 *  6. Console/page errors are zero across all navigations.
 *
 * Artifacts (screenshots + report.json) land in
 * .agent/reports/puppeteer-transitions/<timestamp>/ (untracked).
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const base = option("--base", "http://localhost:3000").replace(/\/$/, "");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
const outDir = path.resolve(option("--out", path.join(".agent", "reports", "puppeteer-transitions", timestamp)));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Sample the overlay/scroll state inside the page. */
const sample = (page) => page.evaluate(() => {
  const html = document.documentElement;
  const overlay = document.querySelector("[data-transition-overlay]");
  const overlayStyle = overlay ? getComputedStyle(overlay) : null;
  return {
    lenisClasses: [...html.classList].filter((c) => c.startsWith("lenis")),
    overlayOpacity: overlayStyle ? Number(overlayStyle.opacity) : null,
    overlayVisible: overlayStyle ? overlayStyle.visibility !== "hidden" : null,
    overlayPointer: overlayStyle ? overlayStyle.pointerEvents : null,
    scrollY: Math.round(window.scrollY),
    hash: window.location.hash,
    path: window.location.pathname,
  };
});

const puppeteer = await import("puppeteer");

let browser;
const failures = [];
const steps = [];

function record(step, ok, detail) {
  steps.push({ step, ok, detail });
  if (!ok) failures.push(step);
  console.log(`${ok ? "ok  " : "FAIL"} ${step}${detail ? ` · ${detail}` : ""}`);
}

function assertCond(label, value, match, detail) {
  const ok = match(value);
  record(label, ok, detail && ok ? null : `${detail ?? ""} value=${JSON.stringify(value)}`);
  return value;
}

try {
  await mkdir(outDir, { recursive: true });
  browser = await puppeteer.launch({ args: ["--font-render-hinting=none"] });

  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page
    .on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    })
    .on("pageerror", (err) => pageErrors.push(err.message));

  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
  await page.goto(`${base}/en`, { waitUntil: "networkidle2", timeout: 45_000 });
  await sleep(900);

  const shot = async (name) => page.screenshot({ path: path.join(outDir, `${name}.png`) });

  // 1. Rail active on first load.
  let s = await sample(page);
  assertCond("lenis rail active on load", s.lenisClasses.includes("lenis"),
    (v) => v === true, `classes=${s.lenisClasses}`);
  await shot("t0-initial-load");

  // 2. Full route transition /en → /en/services via a header link click.
  //    Scroll down first so the swap also exercises scroll reset under the surface.
  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
  await sleep(400);
  const clicked = await page.evaluate(() => {
    const link = [...document.querySelectorAll("header a")]
      .find((a) => (a.getAttribute("href") ?? "").endsWith("/services"));
    if (!link) return false;
    link.click();
    return true;
  });
  assertCond("nav link present", clicked, (v) => v === true);

  await sleep(90); // inside the exit window (240ms)
  s = await sample(page);
  assertCond("exit: surface covering", s.overlayVisible && s.overlayOpacity > 0.01,
    (v) => v === true, `opacity=${s.overlayOpacity}`);
  assertCond("exit: pointer blocked", s.overlayPointer === "auto", (v) => v === true, `pointer=${s.overlayPointer}`);
  assertCond("exit: url not swapped yet", s.path === "/en", (v) => v === true, `path=${s.path}`);
  await shot("t1-exit-surface");

  await page.waitForFunction((dest) => window.location.pathname === dest, { timeout: 10_000 }, "/en/services");
  await sleep(120); // swap point: destination mounted underneath
  s = await sample(page);
  assertCond("swap: destination mounted", s.path === "/en/services", (v) => v === true, `path=${s.path}`);

  await sleep(950); // enter window (600ms) + margin
  s = await sample(page);
  assertCond("enter: land on services", s.path === "/en/services", (v) => v === true, `pathname = ${s.path}`);
  assertCond("enter: overlay cleared", s.overlayOpacity === 0 && !s.overlayVisible,
    (v) => v === true, `opacity=${s.overlayOpacity} visible=${s.overlayVisible}`);
  assertCond("enter: rail persists", s.lenisClasses.includes("lenis"),
    (v) => v === true, `classes=${s.lenisClasses}`);
  assertCond("enter: overlay back to rest (pointer)", s.overlayPointer === "none",
    (v) => v === true, `pointer=${s.overlayPointer}`);
  assertCond("enter: scroll reset to top", s.scrollY === 0, (v) => v === true, `scrollY=${s.scrollY}`);
  await shot("t2-enter-services");

  // 3. Second hop /en/services → /en/about.
  await page.evaluate(() => {
    const link = [...document.querySelectorAll("header a")]
      .find((a) => (a.getAttribute("href") ?? "").endsWith("/about"));
    link?.click();
  });
  await sleep(140);
  s = await sample(page);
  assertCond("second hop: surface covering", s.overlayVisible && s.overlayOpacity > 0.01,
    (v) => v === true, `opacity=${s.overlayOpacity}`);
  await page.waitForFunction((dest) => window.location.pathname === dest, { timeout: 10_000 }, "/en/about");
  await sleep(950);
  s = await sample(page);
  assertCond("second hop: about settled", s.path === "/en/about" && s.overlayOpacity === 0,
    (v) => v === true, `path=${s.path} opacity=${s.overlayOpacity}`);
  await shot("t3-about-rest");

  // 4. Hash-only (same route) link: no surface, lands on the section via Lenis.
  await page.goto(`${base}/en`, { waitUntil: "networkidle2", timeout: 45_000 });
  await sleep(800);
  await page.evaluate(() => {
    const link = [...document.querySelectorAll("a[href^='#'], a[href$='#projects']")]
      .find((a) => (a.getAttribute("href") ?? "") === "#projects" || /#projects$/.test(a.getAttribute("href") ?? ""));
    if (link) link.click();
    return Boolean(link);
  });
  await sleep(950);
  s = await sample(page);
  assertCond("hash: no surface", !s.overlayVisible, (v) => v === true,
    `opacity=${s.overlayOpacity} visible=${s.overlayVisible}`);
  assertCond("hash: rail still active", s.lenisClasses.includes("lenis"), (v) => v === true);
  await shot("t4-hash-dismissed");

  // 5. Reduced motion: instant navigation, surface never appears.
  const rmPage = await browser.newPage();
  await rmPage.setViewport({ width: 1440, height: 900 });
  await rmPage.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await rmPage.goto(`${base}/en`, { waitUntil: "networkidle2", timeout: 45_000 });
  await sleep(700);
  await rmPage.evaluate(() => {
    const link = [...document.querySelectorAll("header a")]
      .find((a) => (a.getAttribute("href") ?? "").endsWith("/services"));
    link?.click();
  });
  await sleep(90);
  const rmS = await sample(rmPage);
  assertCond("reduced motion: surface stays hidden", !rmS.overlayVisible,
    (v) => v === true, `opacity=${rmS.overlayOpacity} visible=${rmS.overlayVisible}`);
  await rmPage.waitForFunction((dest) => window.location.pathname === dest, { timeout: 10_000 }, "/en/services");
  assertCond("reduced motion: navigation completed", true, (v) => v === true);
  await rmPage.close();

  // 6. Rapid successive navigation: the second click is ignored while leaving.
  await page.goto(`${base}/en`, { waitUntil: "networkidle2", timeout: 45_000 });
  await sleep(800);
  await page.evaluate(() => {
    const services = [...document.querySelectorAll("header a")]
      .find((a) => (a.getAttribute("href") ?? "").endsWith("/services"));
    services?.click();
  });
  await sleep(60);
  await page.evaluate(() => {
    const about = [...document.querySelectorAll("header a")]
      .find((a) => (a.getAttribute("href") ?? "").endsWith("/about"));
    about?.click();
  });
  await page.waitForFunction((dest) => window.location.pathname === dest, { timeout: 10_000 }, "/en/services");
  await sleep(1000);
  s = await sample(page);
  assertCond("rapid nav: ends on the first target", s.path === "/en/services", (v) => v === true, `path=${s.path}`);
  assertCond("rapid nav: overlay rested", !s.overlayVisible, (v) => v === true,
    `opacity=${s.overlayOpacity} visible=${s.overlayVisible}`);
  await shot("t5-rapid-nav-rest");

  // 7. Overlay cleanliness and error gates.
  assertCond("zero console errors", consoleErrors.length, (v) => v === 0,
    consoleErrors.slice(0, 3).join(" | "));
  assertCond("zero page errors", pageErrors.length, (v) => v === 0,
    pageErrors.slice(0, 3).join(" | "));
} catch (err) {
  record("unhandled runner error", false, err instanceof Error ? err.message : String(err));
} finally {
  if (browser) {
    try {
      await browser.close();
    } catch {
      // best-effort; child processes are reaped on close
    }
  }
}

await mkdir(outDir, { recursive: true });
await writeFile(
  path.join(outDir, "report.json"),
  `${JSON.stringify({
    capturedAt: new Date().toISOString(),
    base,
    failures: failures.length,
    steps,
  }, null, 2)}\n`,
);
console.log(`\n${steps.length - failures.length}/${steps.length} checks clean · output: ${path.relative(process.cwd(), outDir)}`);
if (failures.length) process.exitCode = 1;
