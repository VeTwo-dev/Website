import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tokensPath = path.join(__dirname, "..", "tokens", "design-tokens.json");
const outPath = path.join(__dirname, "..", "app", "tokens.css");

const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));
const c = tokens.color;
const l = tokens.colorLight;

// English fonts (Inter + Roboto Mono) load via next/font/google (build-time
// fetch, runtime self-hosted). Only PNU keeps local @font-face here.
// Lato/Audiowide/Orbitron files remain on disk, unreferenced — do not
// delete originals.
const faces = [
  "/* Local fonts: PNU (Arabic/RTL). English via next/font variables. */",
  "@font-face {",
  "  font-family: 'PNU';",
  "  src: url('/fonts/PNU/PNU-Light.ttf') format('truetype');",
  "  font-weight: 300;",
  "  font-style: normal;",
  "  font-display: swap;",
  "}",
  "@font-face {",
  "  font-family: 'PNU';",
  "  src: url('/fonts/PNU/PNU-Regular.ttf') format('truetype');",
  "  font-weight: 400;",
  "  font-style: normal;",
  "  font-display: swap;",
  "}",
  "@font-face {",
  "  font-family: 'PNU';",
  "  src: url('/fonts/PNU/PNU-Medium.ttf') format('truetype');",
  "  font-weight: 500;",
  "  font-style: normal;",
  "  font-display: swap;",
  "}",
  "@font-face {",
  "  font-family: 'PNU';",
  "  src: url('/fonts/PNU/PNU-Bold.ttf') format('truetype');",
  "  font-weight: 700;",
  "  font-style: normal;",
  "  font-display: swap;",
  "}",
  "",
].join("\n");

const colorVars = (p) =>
  [
    "  --color-background: " + p.background + ";",
    "  --color-surface: " + p.surface + ";",
    "  --color-elevated: " + p.elevated + ";",
    "  --color-primary-text: " + p.primaryText + ";",
    "  --color-secondary-text: " + p.secondaryText + ";",
    "  --color-secondary-green: " + p.secondaryGreen + ";",
    "  --color-accent: " + p.accent + ";",
    "  --color-accent-2: " + p.alternateAccent + ";",
    "  --color-success: " + p.success + ";",
    "  --color-warning: " + p.warning + ";",
    "  --color-danger: " + p.danger + ";",
    "  --color-info: " + p.info + ";",
    "  --color-border: " + p.border + ";",
    "  --color-input: " + p.input + ";",
    "  --color-on-accent: " + p.onAccent + ";",
  ].join("\n");

const layoutVars = (p, subtle) =>
  [
    "  --radius-control: " + tokens.layout.radius.control + "px;",
    "  --radius-card: " + tokens.layout.radius.card + "px;",
    "  --border-subtle: " + subtle + ";",
    "  --shadow-card: " + tokens.layout.shadow.card + ";",
    "  --shadow-elevated: " + tokens.layout.shadow.elevated + ";",
    "  --focus-ring: " + p.accent + ";",
    "  --focus-width: " + tokens.layout.focus.width + "px;",
    "  --focus-offset: " + tokens.layout.focus.offset + "px;",
    "  --transition-fast: " + tokens.layout.transition.fast + "ms;",
    "  --transition-base: " + tokens.layout.transition.base + "ms;",
    "  --content-max: " + tokens.layout.contentMaxWidth + "px;",
    "  --reading-max: " + tokens.layout.readingMaxWidth + "px;",
  ].join("\n");

const shadcnVars = (p) =>
  [
    "  /* shadcn/ui-style semantic aliases — same values, no second source of truth */",
    "  --background: " + p.background + ";",
    "  --foreground: " + p.primaryText + ";",
    "  --card: " + p.surface + ";",
    "  --card-foreground: " + p.primaryText + ";",
    "  --popover: " + p.elevated + ";",
    "  --popover-foreground: " + p.primaryText + ";",
    "  --primary: " + p.accent + ";",
    "  --primary-foreground: #04110B;",
    "  --secondary: " + p.elevated + ";",
    "  --secondary-foreground: " + p.primaryText + ";",
    "  --muted: " + p.elevated + ";",
    "  --muted-foreground: " + p.secondaryText + ";",
    "  --accent: " + p.accent + ";",
    "  --accent-foreground: #04110B;",
    "  --destructive: " + p.danger + ";",
    "  --destructive-foreground: " + p.primaryText + ";",
    "  --border: " + p.border + ";",
    "  --input: " + p.input + ";",
    "  --ring: " + p.accent + ";",
    "  --radius: " + tokens.layout.radius.control + "px;",
  ].join("\n");

// Font families come from next/font variables (--font-inter / --font-roboto-mono)
// plus the local PNU faces. They are theme-independent, so they are emitted once
// on :root and inherited by every theme block.
const fontVars = () =>
  [
    "  --font-sans: " + tokens.font.stacks.sans.join(", ") + ";",
    "  --font-arabic: " + tokens.font.stacks.arabic.join(", ") + ";",
    "  --font-display: " + tokens.font.stacks.display.join(", ") + ";",
    "  --font-mono: " + tokens.font.stacks.mono.join(", ") + ";",
    "",
  ].join("\n");

const darkBody = [
  "  color-scheme: dark;",
  fontVars(),
  colorVars(c),
  layoutVars(c, tokens.layout.border.subtle),
  "",
  shadcnVars(c),
].join("\n");

const lightBody = [
  "  color-scheme: light;",
  colorVars(l),
  layoutVars(l, tokens.layout.border.subtleLight),
  "",
  shadcnVars(l),
].join("\n");

// Dark is the default (:root). Light applies when the user picks it
// (data-theme="light") or, with no explicit choice, when the OS prefers light.
// The layout's no-flash script always sets data-theme, so the media query is
// only a no-JS fallback.
const css =
  faces +
  ":root {\n" +
  darkBody +
  "\n}\n\n" +
  ':root[data-theme="light"] {\n' +
  lightBody +
  "\n}\n\n" +
  "@media (prefers-color-scheme: light) {\n" +
  "  :root:not([data-theme]) {\n" +
  lightBody
    .split("\n")
    .map((line) => (line ? "  " + line : line))
    .join("\n") +
  "\n  }\n" +
  "}\n";

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, css);
console.log("Wrote " + outPath);
