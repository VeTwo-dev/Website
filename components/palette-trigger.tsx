"use client";

import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { OPEN_PALETTE_EVENT } from "./command-palette";

/** Opens the command palette from any surface (desktop button, mobile menu). */
export function PaletteTrigger({
  locale,
  className = "",
  variant = "search",
}: {
  locale: Locale;
  className?: string;
  variant?: "search" | "menu";
}) {
  const t = getDict(locale);
  const isMenu = variant === "menu";
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT))}
      aria-label={
        isMenu ? t.home.menu : `${t.palette.openCommand} — ${t.search.kbd}`
      }
      data-variant={isMenu ? "menu" : "search"}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 rounded-control border border-input px-3 py-2 text-sm text-secondary transition-colors hover:border-accent/50 hover:text-primary focus-visible:outline-accent",
        className,
      )}
    >
      {isMenu ? (
        <Menu size={16} aria-hidden="true" />
      ) : (
        <Search size={16} aria-hidden="true" />
      )}
      {isMenu ? <span>{t.home.menu}</span> : null}
      {!isMenu ? (
        <kbd className="whitespace-nowrap rounded border border-input px-1.5 py-0.5 font-mono text-[10px] text-secondary">
          {t.search.kbd}
        </kbd>
      ) : null}
    </button>
  );
}
