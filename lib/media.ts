/**
 * Homepage media placeholder manifest — the replacement contract.
 *
 * Workflow to supply a final asset:
 * 1. Place the file under `public/media/home/<section>/` (e.g.
 *    `public/media/home/hero-primary.jpg`).
 * 2. Set that identifier's `path` below to its local URL
 *    (e.g. `/media/home/hero-primary.jpg`). Local paths only — never remote.
 * 3. The existing component renders it with the documented crop, sizing,
 *    alt text, and responsive treatment. No redesign required.
 *
 * A `null` path renders the designed SVG placeholder. Missing assets never
 * produce a broken image or runtime error.
 */

export type MediaKind = "image" | "diagram" | "video" | "gif" | "icon";

export type MediaAsset = {
  /** Stable identifier, e.g. `home.hero.primary-visual`. */
  id: string;
  /** Intended final media type. */
  kind: Exclude<MediaKind, "icon">;
  /** Aspect ratio as `w/h` (drives the reserved layout box). */
  ratio: `${number}/${number}`;
  /** Target display size in px (desktop); used for width/height hints. */
  width: number;
  height: number;
  /** What the asset should communicate. */
  purpose: string;
  /** Focal point, background, transparency, composition notes. */
  art: string;
  /** True when purely decorative (aria-hidden); false needs alt text. */
  decorative: boolean;
  /** Local asset path once supplied, else `null`. */
  path: string | null;
};

const define = (a: MediaAsset): MediaAsset => a;

export const MEDIA: Record<string, MediaAsset> = {
  "home.hero.primary-visual": define({
    id: "home.hero.primary-visual",
    kind: "image",
    ratio: "16/10",
    width: 1024,
    height: 640,
    purpose: "Hero focal visual: dimensional-analysis chart composition.",
    art: "Dark green canvas matching page background; emerald traces; no text baked in (headlines stay HTML).",
    decorative: true,
    path: null,
  }),
  "home.ecosystem.feature-visual": define({
    id: "home.ecosystem.feature-visual",
    kind: "diagram",
    ratio: "4/3",
    width: 640,
    height: 480,
    purpose: "Dependency-graph artwork for the ecosystem preview section.",
    art: "Must depict only verified edges (see lib/ecosystem/graph.ts); light on dark, mono labels.",
    decorative: true,
    path: null,
  }),
  "home.engineering.architecture-visual": define({
    id: "home.engineering.architecture-visual",
    kind: "diagram",
    ratio: "4/3",
    width: 640,
    height: 480,
    purpose: "Units-to-application layering diagram.",
    art: "Layer rails L0/L1/L2 with real package names; same visual language as hero chart.",
    decorative: true,
    path: null,
  }),
  "home.projects.featured-01": define({
    id: "home.projects.featured-01",
    kind: "image",
    ratio: "4/3",
    width: 640,
    height: 480,
    purpose: "Lead featured-project artwork (units engine).",
    art: "Abstract measurement/dimension motif; dark, restrained emerald; no fake UI screenshots.",
    decorative: true,
    path: null,
  }),
};

export function getMedia(id: string): MediaAsset | null {
  return MEDIA[id] ?? null;
}

/** Aspect-ratio utility class for the reserved layout box (no inline styles). */
export const RATIO_CLASS: Partial<Record<MediaAsset["ratio"], string>> = {
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
};

export function ratioClass(ratio: MediaAsset["ratio"]): string {
  return RATIO_CLASS[ratio] ?? "aspect-[4/3]";
}
