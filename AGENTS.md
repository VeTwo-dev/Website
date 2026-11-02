# AGENTS.md — VeTwo Website

Bilingual (EN/AR) Next.js 16 + React 19 + Tailwind v4 site. Bun 1.4 (`bun install`, `bun run dev|lint|typecheck|test|build`). MongoDB was removed from the project; catalog data is static editorial content and Lakebase Postgres (via Neon) + S3-compatible object storage are the provisioned auxiliary services (`neon.ts`, branch `production`); all access server-side via `lib/neon/*`, never exposed to clients. Never invent metrics, capabilities, or telemetry. Admin dashboard is out of scope.

## Skill discovery (mandatory)

Before specialized work, load the smallest covering set from `.opencode/skills/` and follow the full `SKILL.md` — never go by name alone:

- **brand-guidelines** — branding, colors, typography, logos, visual identity.
- **frontend-design** — pages, layouts, components, visual implementation.
- **theme-factory** — theme creation/adaptation/preview (preserve VeTwo identity unless a standalone theme is requested).
- **webapp-testing** — local browser testing, responsive/a11y inspection, UI debugging.
- **shadcn** — creating/adding/updating/composing shadcn components, `components.json`, registries, presets, icon-library and alias questions, component API/docs checks.
- **migrate-radix-to-base** — ONLY when the user explicitly requests a Radix→Base UI migration or resumes an in-progress one. Never start a migration merely because the skill exists.
- **impeccable** (`.github/skills/impeccable/SKILL.md`) — UX design review, critique, polish, and animation of frontend interfaces; load its full `SKILL.md` (plus the referenced playbook) before UI design/refinement work.
- **neon** (`.agents/skills/neon/SKILL.md`) — Neon backend overview; branch-first workflow; prefer CLI over MCP.
- **neon-postgres** (`.agents/skills/neon-postgres/SKILL.md`) — existing `DATABASE_URL`, SQL, schema, pooled (app) vs direct (migrations) connections, `@neondatabase/serverless` driver.
- **neon-object-storage** (`.agents/skills/neon-object-storage/SKILL.md`) — buckets, uploads, S3-compatible access, branch-scoped storage.

Report a missing skill instead of claiming to have loaded it.

## Project references

- Design: `DESIGN.MD`, `tokens/design-tokens.json` (single source of truth), `docs/design-system.md`, `docs/homepage.md`, `docs/catalog.md`.
- Data/APIs: `docs/data-architecture.md`, `docs/ecosystem-audit.md`, `.env.example` (placeholders only).
- Quality/security: `docs/security.md`, `docs/certification-audit.md`, `docs/release-readiness.md`.
- Checks: `bun run lint && bun run typecheck && bun run test && bun run build`.

## Rules

Current user request first, then repo requirements, then skill guidance. Preserve architecture, public API contracts (`/api/v1/public/*`), deps, and conventions unless a change is justified. Distinguish verified facts from unavailable data; keep English canonical with Arabic summaries and correct RTL. Never claim a load, test, or browser result without evidence.

Typography: PNU for Arabic (local); Inter for English body/UI/headings and Roboto Mono selective for code — both via `next/font/google` (build-time fetch, runtime self-hosted; the authorized exception to the former no-remote-fonts rule). Never apply letter-spacing to Arabic text. Font families live in `tokens/design-tokens.json` → `font.stacks` and are emitted by `bun run tokens` into `app/tokens.css` as `--font-sans/--font-display/--font-mono/--font-arabic`; never hard-code a font stack in CSS or components, and keep `lib/tokens.test.ts` passing.

## UI library workflow

- shadcn config: `components.json` (style `new-york`, base `radix`, Tailwind v4, RSC, aliases `@/components`, `@/lib/utils`, `@/components/ui`, icon library `lucide-react`). Check `bunx --bun shadcn@latest info --json` before adding components; never import uninstalled ones.
- No Radix/Base wrappers in use (only `@radix-ui/react-slot` reserved). Do not initiate a Radix→Base migration without explicit user approval; reports would live in `.migration/` per-component if one ever occurs.
- Component rules: semantic tokens only (no raw colors), `cn()` for conditionals, `flex`+`gap` (never `space-x/y`), `size-*` for square boxes, `data-icon` on icons inside Buttons, full Card/Dialog composition with titles, no manual z-index on overlays.
- Preserve VeTwo tokens/typography; map shadcn theme variables onto them, never the reverse. No `--overwrite` without explicit approval.

## Visual reference & design compliance

Canonical reference spec: `docs/design-references/pier-gorelli/design-system.md` (read it before significant UI/page/component design work). It defines the observed layout, type, motion, and component principles, plus the VeTwo adopt/adapt/avoid table. Evidence: `docs/design-references/pier-gorelli/screenshots/` (59 images, indexed by `manifest.json` / `manifest.md`) and `evidence/*.json`.

- Match **principles**, not pixels: hierarchy, container/rhythm, measure, hairlines, metadata, interaction and responsive behaviour.
- Never copy the reference's fonts (Geist), blue/lime palette, cursor, preloader, Lenis layer, copy, or assets. VeTwo tokens and brand are authoritative.
- Numbered indices and mono/technical labels are allowed only when they carry true information; no invented metrics, dimensions, or capabilities.
- Arabic: no outline text, no letter-spacing, line-height ≥ 1.35; mirrored logical spacing; verify EN/AR and RTL.
- Before/after UI work: `bun run visual:qa` (captures under `.agent/reports/visual-qa/<timestamp>/`), compare at 1440/768/390, record evidence, and limit fix→verify loops to 5 unless the user says otherwise. Puppeteer alternative: `bun run qa:browser` (`scripts/puppeteer-qa.mjs`) for screenshots plus console/request/overflow/interaction checks; `bun run qa:transitions` (`scripts/puppeteer-transitions.mjs`) for the page-transition system (exit/enter surface, hash/back skips, reduced motion, rapid navigation — evidence under `.agent/reports/puppeteer-transitions/<timestamp>/`). Architecture: `docs/smooth-scroll.md`, `docs/page-transitions.md`. GSAP usage is restricted to the hero choreography per the reference spec's motion rules.
- Update the reference spec and `docs/design-system.md` when a deliberate design-system change is made.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
