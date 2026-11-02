# Analytics Plan (privacy-friendly)

- Provider: Plausible or compatible (evaluated against Next.js App Router + static-friendly deployment; no extra SDK needed — single deferred script tag).
- Configuration: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (empty = disabled), `NEXT_PUBLIC_PLAUSIBLE_SRC` (default `https://plausible.io/js/script.js`). See `.env.example`.
- Events collected: aggregate page views (automatic) + explicit `cta_ecosystem`, `cta_docs`, `project_search`, `project_view` via `trackEvent()` — aggregate public-site interactions only.
- Explicitly NOT collected: farm names, geolocation, IPs beyond aggregation, telemetry, form content, credentials, personal info, ad trackers, session replay, behavioral profiling.
- Resilience: `components/analytics.tsx` loads script only when configured; `onerror` removes tag; `trackEvent` is try/catch no-op. Analytics failure never breaks pages.
- Docs: this file + `lib/analytics/plausible.ts` are the event registry. Consent/compliance for deployment jurisdiction is UNRESOLVED — verify before claiming compliance.
