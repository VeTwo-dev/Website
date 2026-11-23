import Image from "next/image";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getMedia, ratioClass } from "@/lib/media";

/**
 * Reserved-ratio media slot. Renders the registered local asset when present;
 * otherwise the provided native `children` (verified content), otherwise an
 * intentional SVG placeholder composition. Placeholders are decorative
 * (aria-hidden); supplied assets must provide alt text.
 */
export function MediaSlot({ id, locale, caption, children }: { id: string; locale: Locale; caption?: string; children?: ReactNode }) {
  const asset = getMedia(id);
  if (!asset) return children ? <>{children}</> : null;
  if (asset.path) {
    return (
      <div className={`overflow-hidden rounded-card border border-border bg-surface ${ratioClass(asset.ratio)}`}>
        <Image
          src={asset.path}
          alt={caption ?? asset.purpose}
          width={asset.width}
          height={asset.height}
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
    );
  }
  const label = caption ?? (locale === "ar" ? "مساحة مخصصة للصورة التوضيحية" : "Illustration placeholder");
  const frame = `relative overflow-hidden rounded-card border border-border bg-surface ${ratioClass(asset.ratio)}`;
  if (children) {
    return <div className={frame}>{children}</div>;
  }
  return (
    <div
      role="img"
      aria-label={`${label} — ${asset.purpose}`}
      className={`relative overflow-hidden rounded-card border border-border bg-surface ${ratioClass(asset.ratio)}`}
    >
      <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 640 400">
        <defs>
          <pattern id={`grid-${asset.id}`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" className="stroke-border" strokeWidth="1" />
          </pattern>
          <radialGradient id={`glow-${asset.id}`} cx="50%" cy="42%" r="55%">
            <stop offset="0%" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.16 }} />
            <stop offset="100%" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <rect width="640" height="400" fill={`url(#grid-${asset.id})`} />
        <rect width="640" height="400" fill={`url(#glow-${asset.id})`} />
        <g className="stroke-accent" strokeWidth="1.5" opacity="0.65" fill="none">
          <circle cx="320" cy="190" r="86" />
          <circle cx="320" cy="190" r="46" />
          <line x1="60" y1="190" x2="200" y2="190" />
          <line x1="440" y1="190" x2="580" y2="190" />
          <circle cx="200" cy="190" r="5" className="fill-accent" stroke="none" />
          <circle cx="440" cy="190" r="5" className="fill-accent" stroke="none" />
        </g>
        <circle cx="320" cy="190" r="7" className="fill-mint" />
      </svg>
    </div>
  );
}
