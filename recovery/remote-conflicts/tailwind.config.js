/**
 * Tailwind theme bridge. Color values reference the CSS custom properties in
 * app/tokens.css (generated from tokens/design-tokens.json — single source of
 * truth) so utilities follow the active light/dark theme. lib/tokens.test.ts
 * enforces the bridge: every token must resolve to var(--...) here.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        elevated: "var(--color-elevated)",
        primary: "var(--color-primary-text)",
        secondary: "var(--color-secondary-text)",
        accent: "var(--color-accent)",
        accent2: "var(--color-accent-2)",
        mint: "var(--color-secondary-green)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
        border: "var(--border)",
        input: "var(--input)",
        onAccent: "var(--color-on-accent)",
        ring: "var(--focus-ring)",
      },
      maxWidth: {
        content: "1280px",
        reading: "840px",
      },
      borderRadius: {
        control: "8px",
        card: "16px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
