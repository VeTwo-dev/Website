/**
 * CSP builder (pure, tested). Nonce-based per the Next.js strict-CSP pattern:
 * the proxy generates a per-request nonce, sends it as `x-nonce`, and Next.js
 * applies it to framework inline scripts automatically.
 * `unsafe-eval` appears ONLY in development (React debugging requirement).
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  const parts = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://plausible.io https://*.plausible.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];
  return parts.join("; ");
}
