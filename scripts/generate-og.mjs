/**
 * Generates public/og.png — the 1200×630 social card.
 *
 * Rendered inside a real VeTwo page so the self-hosted Inter faces and the
 * token-driven CSS variables are exactly what ships. Colors, radius, and the
 * horse-head mark come from tokens/design-tokens.json + public/icon.svg; no
 * invented copy (tagline is the official one).
 *
 * Usage: bun scripts/generate-og.mjs [baseUrl]
 */
import puppeteer from "puppeteer";
import { readFile, writeFile } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3001";
const WIDTH = 1200;
const HEIGHT = 630;

const tokens = JSON.parse(await readFile("tokens/design-tokens.json", "utf8"));
const c = tokens.color;
const iconSvg = await readFile("public/icon.svg", "utf8");

const browser = await puppeteer.launch({
  args: ["--font-render-hinting=none"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(`${base}/en`, { waitUntil: "networkidle2", timeout: 90000 });
await page.evaluate(() => document.fonts.ready);

const shot = await page.evaluate(
  ({ w, h, colors, icon }) => {
    const rootStyle = getComputedStyle(document.documentElement);
    const sans =
      rootStyle.getPropertyValue("--font-sans").trim() ||
      "Inter, system-ui, sans-serif";
    const mono =
      rootStyle.getPropertyValue("--font-mono").trim() ||
      "ui-monospace, monospace";

    document.body.innerHTML = "";
    document.body.style.margin = "0";

    const card = document.createElement("div");
    card.id = "og-card";
    card.style.cssText = [
      `width:${w}px`,
      `height:${h}px`,
      "position:fixed",
      "inset:0 auto auto 0",
      "overflow:hidden",
      `background:${colors.background}`,
      `color:${colors.primaryText}`,
      `font-family:${sans}`,
      "isolation:isolate",
    ].join(";");

    const glow = document.createElement("div");
    glow.style.cssText = [
      "position:absolute",
      "width:720px",
      "height:720px",
      "border-radius:9999px",
      "right:-240px",
      "top:-260px",
      `background:radial-gradient(circle, ${colors.accent}2e 0%, transparent 68%)`,
    ].join(";");

    const grid = document.createElement("div");
    grid.style.cssText = [
      "position:absolute",
      "inset:0",
      "background-image:linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
      "background-size:64px 64px",
      "mask-image:linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 85%)",
    ].join(";");

    const inner = document.createElement("div");
    inner.style.cssText = [
      "position:relative",
      "z-index:1",
      "height:100%",
      "box-sizing:border-box",
      "padding:64px 72px",
      "display:flex",
      "flex-direction:column",
      "justify-content:space-between",
      `border:1px solid ${colors.border}`,
    ].join(";");

    const brand = document.createElement("div");
    brand.style.cssText = "display:flex;align-items:center;gap:18px";
    const mark = document.createElement("img");
    mark.src = `data:image/svg+xml;base64,${btoa(icon)}`;
    mark.alt = "";
    mark.style.cssText = "width:56px;height:56px;object-fit:contain";
    const wordmark = document.createElement("span");
    wordmark.textContent = "VeTwo";
    wordmark.style.cssText = [
      "font-size:34px",
      "font-weight:600",
      "letter-spacing:-0.02em",
    ].join(";");
    const chip = document.createElement("span");
    chip.textContent = "OPEN-SOURCE VETTECH";
    chip.style.cssText = [
      "margin-inline-start:14px",
      "font-family:" + mono,
      "font-size:12px",
      "letter-spacing:0.14em",
      `color:${colors.secondaryGreen}`,
      `border:1px solid ${colors.border}`,
      "border-radius:9999px",
      "padding:6px 14px",
    ].join(";");
    brand.append(mark, wordmark, chip);

    const heading = document.createElement("div");
    heading.textContent =
      "Revolutionizing Veterinary care through Engineering & Code";
    heading.style.cssText = [
      "font-size:56px",
      "line-height:1.08",
      "font-weight:600",
      "letter-spacing:-0.03em",
      "max-width:900px",
      "text-wrap:balance",
    ].join(";");

    const foot = document.createElement("div");
    foot.style.cssText = [
      "display:flex",
      "align-items:center",
      "justify-content:space-between",
      `border-top:1px solid ${colors.border}`,
      "padding-top:24px",
      "font-family:" + mono,
      "font-size:15px",
      `color:${colors.secondaryText}`,
    ].join(";");
    const domain = document.createElement("span");
    domain.textContent = "vetwo.dev";
    domain.style.cssText = `color:${colors.primaryText}`;
    const tag = document.createElement("span");
    tag.textContent = "Animal health · Engineering · Open source";
    foot.append(domain, tag);

    inner.append(brand, heading, foot);
    card.append(glow, grid, inner);
    document.body.append(card);
    document.documentElement.style.background = colors.background;

    const r = card.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  },
  { w: WIDTH, h: HEIGHT, colors: c, icon: iconSvg },
);

await page.screenshot({ path: "public/og.png", clip: shot });
await browser.close();

const { size } = await import("node:fs/promises").then((fs) =>
  fs.stat("public/og.png"),
);
const header = await readFile("public/og.png");
// PNG IHDR: width/height live at bytes 16..24 (big-endian).
const width = header.readUInt32BE(16);
const height = header.readUInt32BE(20);
await writeFile(
  ".agent/reports/og-card.json",
  JSON.stringify({ size, width, height, generatedFrom: base }, null, 2),
);
console.log(`public/og.png ${width}x${height} ${Math.round(size / 1024)}KB`);
