import { readFileSync } from "node:fs";

const REF = JSON.parse(readFileSync("docs/design-references/pier-gorelli/evidence/metrics.json", "utf8"));
const globals = readFileSync("app/globals.css", "utf8");

function parseClass(regex) {
  const m = globals.match(regex);
  if (!m) return null;
  const block = m[0];
  const fs = block.match(/font-size:\s*([^;]+);/);
  const lh = block.match(/line-height:\s*([^;]+);/);
  const ls = block.match(/letter-spacing:\s*([^;]+);/);
  return { fs: fs?.[1]?.trim(), lh: lh?.[1]?.trim(), ls: ls?.[1]?.trim() };
}

// VeTwo measured values at 1440px viewport (clamp() resolves to a specific px;
// we compute the clamp value at 1440px viewport width).
function clampPx(expr, vp) {
  // expr like "clamp(2.75rem, 5.4vw + 0.5rem, 3.75rem)"
  const m = expr.match(/clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
  if (!m) return null;
  const min = parseFloat(m[1]) * 16;            // rem -> px at 16px root
  const fluid = m[2].trim();
  const vw = parseFloat(fluid.match(/([\d.]+)vw/)[1]);
  const rem = fluid.match(/([\d.]+)rem/);
  const remPx = rem ? parseFloat(rem[1]) * 16 : 0;
  const fluidPx = (vw / 100) * vp + remPx;
  const max = parseFloat(m[3]) * 16;
  return Math.min(Math.max(min, fluidPx), max);
}

const v1440 = {};
const display = parseClass(/\.text-display \{[\s\S]*?\}/);
if (display) {
  v1440.display = {
    size: clampPx(display.fs, 1440),
    lh: parseFloat(display.lh),
    ls: display.ls,
  };
}
const h1Block = globals.match(/font-size:\s*clamp\(3\.5rem[\s\S]*?letter-spacing:\s*(-?[\d.]+)em/);
if (h1Block) {
  const fsM = globals.match(/font-size:\s*(clamp\([^)]+\))/);
  v1440.h1 = { size: clampPx(fsM[1], 1440), lh: 0.82, ls: -0.045 };
}

console.log("=== PRINCIPLE-BY-PRINCIPLE COMPARISON (1440x900) ===\n");

const r = REF["1440x900"];
const rows = [
  {
    principle: "Editorial hierarchy — display size",
    ref: r.type.display.fontSize,
    veTwo: v1440.display ? v1440.display.size.toFixed(1) : "?",
    unit: "px",
    verdict: "",
  },
  {
    principle: "Display line-height (tight)",
    ref: (parseFloat(r.type.display.lineHeight) / parseFloat(r.type.display.fontSize)).toFixed(3),
    veTwo: v1440.display ? v1440.display.lh.toFixed(3) : "?",
    unit: "ratio",
    verdict: "",
  },
  {
    principle: "Display letter-spacing (negative)",
    ref: r.type.display.letterSpacing,
    veTwo: v1440.display ? v1440.display.ls : "?",
    unit: "em",
    verdict: "",
  },
  {
    principle: "H2 size",
    ref: r.type.h2.fontSize,
    veTwo: "?",
    unit: "px",
    verdict: "(VeTwo uses Tailwind text-3xl/4xl = 30/36px per spec §3.2 Adapt)",
  },
  {
    principle: "Body size",
    ref: r.type.body.fontSize,
    veTwo: "18px (Tailwind text-base)",
    unit: "px",
    verdict: "",
  },
  {
    principle: "Mono label size",
    ref: r.type.monoNote.fontSize,
    veTwo: "12px (Tailwind text-xs = 0.75rem)",
    unit: "px",
    verdict: "",
  },
  {
    principle: "Container content width",
    ref: r.grid12.width,
    veTwo: "1280px (container-content token)",
    unit: "px",
    verdict: "Spec §2.2: keep VeTwo's 1280px; do not import 1377px",
  },
  {
    principle: "Section top spacing",
    ref: r.sectionSpacing.paddingTop,
    veTwo: "py-20 sm:py-24 lg:py-28 = 80/96/112px",
    unit: "px",
    verdict: "Spec §2.2: approved adaptation of 88-158px",
  },
  {
    principle: "Font family",
    ref: r.type.display.fontFamily,
    veTwo: "Inter (Latin) / PNU (Arabic) / Roboto Mono (labels)",
    unit: "",
    verdict: "Spec §3.2: Geist NOT adopted — VeTwo fonts authoritative",
  },
];

for (const row of rows) {
  console.log(`${row.principle.padEnd(52)} | ref ${String(row.ref).padEnd(14)} | veTwo ${String(row.veTwo).padEnd(34)} ${row.unit}`);
  if (row.verdict) console.log(`${"".padEnd(54)} | ${row.verdict}`);
}

console.log("\n=== ADOPT / ADAPT / AVOID (spec §7) ===");
console.log("Adopted:  numbered section headers, mono metadata, constrained reading measure, larger editorial section rhythm");
console.log("Adapted:  section heading scale (30/36px), outline-text scroll fill (English only, not implemented)");
console.log("Avoided:  Geist fonts, blue/lime accent, exact layouts/copy/assets, custom cursor, Lenis, branded preloader");
console.log("Avoided:  outline text or letter-spacing on Arabic (PNU requires normal tracking, lh >= 1.35)");
console.log("Avoided:  dimension/telemetry labels without verified values");
