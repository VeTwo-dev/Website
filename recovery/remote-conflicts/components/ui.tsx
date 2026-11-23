import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  external?: boolean;
};

const VARIANTS: Record<string, string> = {
  primary:
    "bg-accent text-onAccent font-semibold hover:brightness-110 active:brightness-125 disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "border border-border text-primary hover:border-accent/60 hover:bg-accent/10 active:bg-accent/20 disabled:opacity-50 disabled:pointer-events-none",
  ghost:
    "text-secondary hover:text-primary hover:bg-elevated active:bg-elevated disabled:opacity-50 disabled:pointer-events-none",
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  external = false,
}: ButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm transition-colors focus-visible:outline-accent",
        VARIANTS[variant],
        className,
      )}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/**
 * Editorial section header. Mirrors the reference pattern: a mono index row
 * (`[0N] LABEL`) with optional right-hand metadata, a hairline, then the
 * heading and its lead paragraph.
 */
export function SectionHead({
  index,
  label,
  meta,
  title,
  sub,
  display = false,
  className = "",
}: {
  index: string;
  label: string;
  meta?: string;
  title: string;
  sub?: string;
  display?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-4 border-t border-border pt-3 font-mono text-xs text-secondary">
        <span className="text-mint">[{index}]</span>
        <span className="truncate">{label}</span>
        {meta ? (
          <>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span className="hidden shrink-0 sm:inline">{meta}</span>
          </>
        ) : (
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        )}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <h2
          className={cn(
            "text-balance text-3xl font-semibold sm:text-4xl lg:col-span-7",
            display && "font-display",
          )}
        >
          {title}
        </h2>
        {sub ? (
          <p className="max-w-prose text-pretty text-secondary lg:col-span-4 lg:col-start-9">
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Technical plate: a hairline frame that carries mono corner metadata, used
 * for diagrams and figures in place of photographic media.
 */
export function Plate({
  label,
  meta,
  children,
  className = "",
}: {
  label: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "relative border border-border bg-surface/40 p-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 pb-2 font-mono text-[11px] text-secondary">
        <span className="min-w-0 truncate">{label}</span>
        {meta ? (
          <span className="hidden shrink-0 sm:inline" dir="ltr">
            {meta}
          </span>
        ) : null}
      </div>
      {children}
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}

/** Hairline-separated mono metadata row. */
export function MetaRow({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-background px-4 py-4">
          <dt className="font-mono text-[11px] text-secondary">{item.label}</dt>
          <dd
            className="mt-1 font-mono text-lg font-semibold text-mint"
            dir="ltr"
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** One row of the work list: index, title, metadata, summary, links. */
export function WorkRow({
  index,
  total,
  name,
  category,
  status,
  description,
  technologies,
  date,
  href,
}: {
  index: string;
  total: string;
  name: string;
  category: string;
  status: string;
  description: string;
  technologies: string[];
  date?: string;
  href: string;
}) {
  return (
    <article className="group grid gap-4 border-t border-border py-8 transition-colors hover:border-accent/50 lg:grid-cols-12 lg:gap-6">
      <div className="flex items-baseline gap-3 font-mono text-xs text-secondary lg:col-span-2">
        <span className="text-mint">{index}</span>
        <span aria-hidden="true">/</span>
        <span dir="ltr">{total}</span>
      </div>
      <div className="lg:col-span-6">
        <h3 className="font-mono text-xl font-semibold">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:text-mint"
          >
            {name}
            <span aria-hidden="true" className="text-mint">
              ↗
            </span>
          </a>
        </h3>
        <p className="mt-2 max-w-prose text-pretty text-secondary">
          {description}
        </p>
      </div>
      <div className="font-mono text-xs text-secondary lg:col-span-4">
        <p>
          <span className="text-mint">{category}</span>
          <span aria-hidden="true"> · </span>
          {status}
        </p>
        {technologies.length ? (
          <p className="mt-1" dir="ltr">
            {technologies.join(" · ")}
          </p>
        ) : null}
        {date ? (
          <p className="mt-1" dir="ltr">
            {date}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** Numbered process step. */
export function ProcessStep({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-t border-border pt-4">
      <p className="font-mono text-xs text-mint" aria-hidden="true">
        [{index}]
      </p>
      <h3 className="mt-3 text-balance font-semibold">{title}</h3>
      <p className="mt-2 text-pretty text-secondary">{description}</p>
    </div>
  );
}

/** Interior page masthead: mono eyebrow, display title, lead. */
export function PageIntro({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border">
      <div className="container-content pt-32 pb-14 sm:pt-40 sm:pb-20">
        <p className="font-mono text-[11px] text-secondary">
          <span className="text-mint">{eyebrow}</span>
        </p>
        <h1 className="text-balance text-display mt-6 max-w-4xl font-bold">{title}</h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg text-secondary">{lead}</p>
        {children}
      </div>
    </section>
  );
}

/** Closing call to action shared by interior pages. */
export function CtaBand({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border">
      <div className="container-content py-20 sm:py-24">
        <h2 className="max-w-3xl text-balance text-3xl font-semibold sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-xl text-pretty text-secondary">{lead}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>
      </div>
    </section>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "info";
}) {
  const tones: Record<string, string> = {
    default: "border-accent/30 bg-accent/10 text-mint",
    success: "border-success/30 bg-success/10 text-mint",
    warning: "border-warning/30 bg-warning/10 text-warning",
    info: "border-info/30 bg-info/10 text-info",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
