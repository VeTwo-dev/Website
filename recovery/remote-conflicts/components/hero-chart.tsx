import { buildGraph, layoutGraph, VERIFIED_EDGES } from "@/lib/ecosystem/graph";

const DIMENSIONS = ["Mass", "Time", "Energy", "Currency", "Count"];
const W = 640;
const H = 400;

/**
 * Dimensional-analysis chart: the units engine's real base dimensions as
 * measurement rails, the 12 catalogued packages as plotted nodes grouped by
 * ecosystem layer, and the verified runtime edges as solid traces.
 * Pure server-rendered SVG — meaningful with JS and motion disabled.
 */
export function HeroChart({ label }: { label: string }) {
  const { nodes } = buildGraph();
  const pos = layoutGraph(nodes, W - 140, H - 40);
  const ox = 130;
  const oy = 10;
  const short = (s: string) => (s.length > 15 ? `${s.slice(0, 14)}…` : s);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="hero-chart w-full [direction:ltr]" role="img" aria-label={label}>
      <defs>
        <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" className="stroke-border" strokeWidth="1" />
        </pattern>
        <radialGradient id="hero-glow" cx="62%" cy="38%" r="60%">
          <stop offset="0%" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.14 }} />
          <stop offset="100%" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#hero-grid)" />
      <rect width={W} height={H} fill="url(#hero-glow)" />
      {DIMENSIONS.map((d, i) => {
        const y = 40 + i * 72;
        return (
          <g key={d} fontFamily="monospace" fontSize="10" className="fill-secondary">
            <line x1={8} y1={y} x2={ox - 14} y2={y} className="stroke-input" strokeWidth="1" />
            <circle cx={ox - 8} cy={y} r="2.5" className="fill-accent" opacity="0.7" />
            <text x={8} y={y - 6}>{d}</text>
          </g>
        );
      })}
      {VERIFIED_EDGES.filter((e) => e.kind === "runtime").map((e) => {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        if (!a || !b) return null;
        return (
          <line
            key={`${e.from}>${e.to}`}
            data-hero-edge
            x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy}
            className="stroke-accent" strokeWidth="1.6" opacity="0.8"
          />        );
      })}
      {VERIFIED_EDGES.filter((e) => e.kind === "conceptual").map((e) => {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        if (!a || !b) return null;
        return (
          <line
            key={`${e.from}>${e.to}`}
            x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy}
            className="stroke-secondary" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.7"
          />
        );
      })}
      {nodes.map((n) => {
        const p = pos.get(n.slug);
        if (!p) return null;
        const published = n.kind === "package";
        return (
          <g key={n.slug} data-hero-node>
            <title>{`${n.name} — ${n.category}, ${n.kind}`}</title>
            {published ? (
              <circle cx={p.x + ox} cy={p.y + oy} r="7" className="fill-elevated stroke-accent" strokeWidth="1.6" />
            ) : (
              <rect x={p.x + ox - 6} y={p.y + oy - 6} width="12" height="12" rx="2.5" className="fill-elevated stroke-secondary" strokeWidth="1.4" />
            )}
            <text x={p.x + ox} y={p.y + oy + 22} textAnchor="middle" fontSize="10" className="fill-primary" fontFamily="monospace">
              {short(n.name)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
