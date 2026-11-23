"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

/** Custom event used by the header (and the mobile menu) to open the palette. */
export const OPEN_PALETTE_EVENT = "vetwo:open-palette";

export type PaletteItem = {
  id: string;
  group: "go" | "actions";
  label: string;
  hint?: string;
  href: string;
  external?: boolean;
  /** Executed instead of navigating when the item is chosen. */
  action?: "toggle-theme";
};

export function CommandPalette({ locale, items }: { locale: Locale; items: PaletteItem[] }) {
  const t = getDict(locale);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.label} ${item.hint ?? ""}`.toLowerCase().includes(q));
  }, [items, query]);

  const groups = useMemo(() => {
    const go = filtered.filter((i) => i.group === "go");
    const actions = filtered.filter((i) => i.group === "actions");
    return [
      { key: "go" as const, label: t.palette.goTo, items: go },
      { key: "actions" as const, label: t.palette.actions, items: actions },
    ].filter((g) => g.items.length > 0);
  }, [filtered, t.palette.goTo, t.palette.actions]);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    setQuery("");
    setActiveIndex(0);
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) dialogRef.current.close();
        else open();
      }
    }
    function onOpenRequest() {
      open();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenRequest);
    };
  }, [open]);

  let flatIndex = -1;

  return (
    <dialog
      ref={dialogRef}
      aria-label={t.palette.label}
      onClose={() => setQuery("")}
      className="palette-dialog"
      /* Independent scroll container: Lenis must not claim wheel/touch
         inside the modal dialog (native scrolling still works here). */
      data-lenis-prevent=""
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Search size={16} aria-hidden="true" className="text-secondary" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              const next = filtered.length ? (activeIndex + 1) % filtered.length : 0;
              setActiveIndex(next);
              linksRef.current[next]?.focus();
            }
          }}
          placeholder={t.palette.placeholder}
          aria-label={t.palette.placeholder}
          className="min-h-[44px] flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-secondary"
        />
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded-control border border-input px-3 py-1.5 font-mono text-xs text-secondary transition-colors hover:text-primary focus-visible:outline-accent"
        >
          {t.palette.close}
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {t.palette.results.replace("{n}", String(filtered.length))}
      </p>

      <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
        {groups.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-secondary">{t.palette.noResults}</p>
        ) : (
          groups.map((group) => (
            <div key={group.key} className="mb-2 last:mb-0">
              <p className="px-3 py-2 font-mono text-[11px] text-secondary">{group.label}</p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  flatIndex += 1;
                  const index = flatIndex;
                  return (
                    <li key={item.id}>
                      <a
                        ref={(node) => {
                          linksRef.current[index] = node;
                        }}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noreferrer" : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          dialogRef.current?.close();
                          if (item.action === "toggle-theme") {
                            const root = document.documentElement;
                            const next = root.dataset.theme === "light" ? "dark" : "light";
                            root.setAttribute("data-theme", next);
                            try {
                              localStorage.setItem("theme", next);
                            } catch {
                              /* storage unavailable */
                            }
                            window.dispatchEvent(new Event("vetwo-theme-change"));
                            return;
                          }
                          if (item.external) {
                            window.open(item.href, "_blank", "noreferrer");
                            return;
                          }
                          window.location.assign(item.href);
                        }}
                        onFocus={() => setActiveIndex(index)}
                        onKeyDown={(event) => {
                          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                            event.preventDefault();
                            const delta = event.key === "ArrowDown" ? 1 : -1;
                            const next = filtered.length
                              ? (activeIndex + delta + filtered.length) % filtered.length
                              : 0;
                            setActiveIndex(next);
                            linksRef.current[next]?.focus();
                          }
                        }}
                        className={
                          "flex min-h-[44px] items-center justify-between gap-3 rounded-control px-3 py-2 text-sm transition-colors " +
                          (activeIndex === index
                            ? "bg-elevated text-primary"
                            : "text-secondary hover:bg-elevated hover:text-primary")
                        }
                      >
                        <span className="truncate">{item.label}</span>
                        <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-secondary">
                          {item.hint}
                          <CornerDownLeft size={12} aria-hidden="true" />
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      <p className="border-t border-border px-4 py-2 font-mono text-[11px] text-secondary">{t.palette.hint}</p>
    </dialog>
  );
}
