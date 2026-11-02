/**
 * Interim brand mark. The official electronic horse-head logo was NOT found in
 * this repository (see docs/logo-inventory.md). This geometric placeholder is
 * intentionally abstract and must be replaced by the official SVG when provided.
 * It does not claim to be the official logo.
 */
export function HorseMark({ size = 34 }: { size?: number }) {
  // Static size classes (CSP-safe: no inline styles). Supported sizes only.
  const box = size >= 64 ? "size-[92px]" : "size-[34px]";
  const mark = size >= 64 ? 82 : 24;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-xl border border-accent/40 bg-gradient-to-br from-accent/25 to-transparent ${box}`}
    >
      <svg width={mark} height={mark} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 20 L9 4 L12 8 L15 4 L19 20 L15.5 20 L14.5 12 L12 15 L9.5 12 L8.5 20 Z"
          className="stroke-accent"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="18" r="1.2" className="fill-mint" />
      </svg>
    </span>
  );
}
