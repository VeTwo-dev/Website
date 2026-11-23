import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import tokens from "../tokens/design-tokens.json";

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, p), "utf8");
const configText = read("../tailwind.config.js");
const css = read("../app/tokens.css");

const VAR_BY_KEY: Record<string, string> = {
  background: "--color-background",
  surface: "--color-surface",
  elevated: "--color-elevated",
  primaryText: "--color-primary-text",
  secondaryText: "--color-secondary-text",
  secondaryGreen: "--color-secondary-green",
  accent: "--color-accent",
  alternateAccent: "--color-accent-2",
  success: "--color-success",
  warning: "--color-warning",
  danger: "--color-danger",
  info: "--color-info",
  border: "--border",
  input: "--input",
  onAccent: "--color-on-accent",
};

describe("design token single source of truth", () => {
  it("tailwind maps every color token to its CSS variable (theme-aware)", () => {
    for (const key of Object.keys(tokens.color)) {
      const cssVar = VAR_BY_KEY[key];
      expect(cssVar, `missing var mapping for ${key}`).toBeTruthy();
      expect(configText, `color token ${key}`).toContain(`var(${cssVar})`);
    }
  });

  it("light palette mirrors the dark palette's keys", () => {
    expect(Object.keys(tokens.colorLight).sort()).toEqual(Object.keys(tokens.color).sort());
  });

  it("generated CSS carries dark defaults and light overrides for every color", () => {
    expect(css).toContain(":root {");
    expect(css).toContain("color-scheme: dark;");
    expect(css).toContain(':root[data-theme="light"] {');
    expect(css).toContain("color-scheme: light;");
    expect(css).toContain("prefers-color-scheme: light");
    for (const value of Object.values(tokens.color)) {
      expect(css, `dark value ${value}`).toContain(value);
    }
    for (const value of Object.values(tokens.colorLight)) {
      expect(css, `light value ${value}`).toContain(value);
    }
  });

  it("radii mirror the token layout scale", () => {
    expect(configText).toContain(`${tokens.layout.radius.control}px`);
    expect(configText).toContain(`${tokens.layout.radius.card}px`);
  });

  it("generated CSS carries elevation, border, focus, and motion tokens", () => {
    expect(css).toContain(`--border-subtle: ${tokens.layout.border.subtle}`);
    expect(css).toContain(`--shadow-card: ${tokens.layout.shadow.card}`);
    expect(css).toContain(`--shadow-elevated: ${tokens.layout.shadow.elevated}`);
    expect(css).toContain(`--focus-ring: ${tokens.layout.focus.ring}`);
    expect(css).toContain(`--transition-base: ${tokens.layout.transition.base}ms`);
  });

  it("declares Inter/Roboto Mono/PNU stacks (next/font, build-time fetch)", () => {
    expect(tokens.font.sans).toBe("Inter");
    expect(tokens.font.display).toBe("Inter");
    expect(tokens.font.mono).toBe("Roboto Mono");
    expect(tokens.font.arabic).toBe("PNU");
    expect(tokens.font.stacks.sans[0]).toBe("var(--font-inter)");
    expect(tokens.font.stacks.display[0]).toBe("var(--font-inter)");
    expect(tokens.font.stacks.mono[0]).toBe("var(--font-roboto-mono)");
    expect(tokens.font.stacks.arabic[0]).toBe("PNU");
    expect(JSON.stringify([tokens.font.sans, tokens.font.display, tokens.font.arabic, tokens.font.mono, tokens.font.stacks])).not.toMatch(/plex|jetbrains|lato|audiowide|orbitron/i);
  });

  it("emits the font variables the CSS and Tailwind config consume", () => {
    // globals.css and tailwind.config.js read --font-sans/--font-arabic/
    // --font-display/--font-mono. If the generator stops emitting them the
    // page silently falls back to system-ui instead of Inter/Roboto Mono.
    for (const key of ["sans", "arabic", "display", "mono"] as const) {
      expect(css, `--font-${key} must be defined`).toContain(`--font-${key}:`);
    }
    expect(css).toContain("--font-sans: var(--font-inter), PNU, system-ui, sans-serif;");
    expect(css).toContain("--font-display: var(--font-inter), PNU, system-ui, sans-serif;");
    expect(css).toContain("--font-arabic: PNU, system-ui, sans-serif;");
    expect(css).toContain("--font-mono: var(--font-roboto-mono), ui-monospace, monospace;");
    expect(configText).toContain("var(--font-sans)");
    expect(configText).toContain("var(--font-display)");
    expect(configText).toContain("var(--font-mono)");
  });

  it("generated CSS carries local PNU @font-face with swap and no remote URLs", () => {
    expect(css).toContain("font-family: 'PNU'");
    expect(css).toContain("font-display: swap");
    expect(css).toContain("/fonts/PNU/PNU-Regular.ttf");
    expect(css).not.toContain("font-family: 'Lato'");
    expect(css).not.toContain("font-family: 'Audiowide'");
    expect(css).not.toContain("font-family: 'Orbitron'");
    expect(css).not.toMatch(/googleapis|gstatic|https?:\/\/[^/]*font/i);
  });
});
