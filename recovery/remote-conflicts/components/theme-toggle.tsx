"use client";

import { useSyncExternalStore } from "react";
import ThemeToggleBase, { type ThemeToggleValue } from "./smoothui/theme-toggle";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

// The DOM's data-theme is the source of truth; this tiny store keeps the
// toggle in sync without setState-in-effect and without hydration drift
// (the layout's nonce-approved inline script applies it before first paint).
const THEME_EVENT = "vetwo-theme-change";

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function getSnapshot(): "light" | "dark" {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerSnapshot(): "light" | "dark" {
  return "dark";
}

function applyTheme(next: ThemeToggleValue) {
  if (next !== "light" && next !== "dark") return; // system is not in this build
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* storage unavailable (private mode) — theme still applies for this visit */
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/**
 * Header theme switch: the smoothui sun-moon toggle (moon ⇄ sun, mask-morph
 * + ray animation), wired to the site's persistent data-theme. Rendered as a
 * compact `size-7` (28px) chip: the wrapper carries the border/surface style
 * and `p-1`, and the inner cycle button is paddingless (`triggerClassName`),
 * so the 18px glyph and its animation fill the box width/height exactly
 * without clipping or doubling up padding — matching the V2 logo chip.
 */
export function ThemeToggle({ locale }: { locale: Locale }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = getDict(locale);

  return (
    <ThemeToggleBase
      variant="sun-moon"
      size="sm"
      showSystem={false}
      theme={theme}
      onThemeChange={applyTheme}
      ariaLabels={{
        toLight: t.common.themeToLight,
        toDark: t.common.themeToDark,
        group: t.common.themeToggle,
        lightSelected: t.common.lightThemeSelected,
        darkSelected: t.common.darkThemeSelected,
      }}
      triggerClassName="p-0"
      className="size-7 shrink-0 justify-center rounded-control border border-border bg-surface p-1 text-accent"
    />
  );
}
