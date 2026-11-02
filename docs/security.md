# Security Baseline

Implemented:

- No hardcoded secrets; `.env.example` placeholders only; `.gitignore` covers `.env*`, `.next`, logs.
- Server-only DB access (`lib/db/*` imported by route handlers only); no `MONGODB_*` in client bundles (only `NEXT_PUBLIC_*` analytics/site vars are exposed).
- Zod validation on all API inputs; bounded limits; safe error shapes (no stacks/credentials).
- Security headers: per-request nonce CSP in `proxy.ts` (built by `lib/security/csp.ts`: `script-src 'self' nonce strict-dynamic`, no `unsafe-eval`/`unsafe-inline` for scripts in production; `unsafe-eval` in development only per Next.js React debugging requirement), `nosniff`, strict `Referrer-Policy`, minimal `Permissions-Policy`, `DENY` framing, HSTS (effective on HTTPS deployments).
- Rate limiting: 100 req/min/IP on public API (provisional per brief, documented as such) with `Retry-After`.
- Safe rendering: no `dangerouslySetInnerHTML`; docs are static TS strings, not raw Markdown/MDX pipeline (MDX deferred until sanitized pipeline approved).
- Redacted logs: `console` usage avoids PII; global-error UI shows no internals.

Remaining risks / TODO:

- CSP (Prompt 4 browser finding): nonce-based `script-src` fixed blocked hydration scripts. `style-src-attr 'unsafe-inline'` is allowed because nonces cannot authorize `style` attributes, and the circuit backdrop and gradient stops set per-element CSS custom properties; `<style>` elements still require the request nonce and `script-src` stays nonce + `strict-dynamic`. Browser re-verification: zero CSP console errors.
- Secret scanning + push protection: enable in GitHub repo settings (not codifiable here) — see CI workflow.
- Rate-limit store is in-memory (single instance). For multi-instance prod, move to edge KV/Upstash with same semantics.
- No auth surface exists (correct for this phase); admin phase must add sessions, MFA, audit logs.
