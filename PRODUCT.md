# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: veterinary practitioners and producers — veterinarians, nutritionists, and animal-health or feed producers who evaluate whether VeTwo's tooling is credible, scientifically sound, and applicable to real animal-health, nutrition, and feed-formulation work. Their job is to judge VeTwo's engineering and scientific seriousness and to find trustworthy tools they can rely on.

Secondary audiences present in the ecosystem and content: TypeScript/JavaScript developers adopting the open-source packages, contributors, and students/researchers. The site is built first for the veterinary/producer side.

## Product Purpose

vetwo.dev is the official public website for VeTwo, an open-source veterinary technology ecosystem. It exists to establish VeTwo's credibility by presenting its real, verified open-source work: a catalog of documented projects, their documentation, and manifest-verified ecosystem relationships. Success means a visitor comes to trust that VeTwo is a serious engineering effort at the intersection of veterinary medicine and software — not a marketing shell.

## Positioning

VeTwo bridges veterinary medicine and advanced technology by building small, focused, type-safe open-source packages grounded in scientific correctness — for example, a dependency-free dimensional-analysis units engine in which invalid science (mg/kg vs %) cannot silently combine. A generic SaaS or dev-tool site could not truthfully copy this union of scientific rigor, veterinary domain, and evidence-only presentation.

## Operating Context

- The catalog is static editorial content (`lib/projects/data.ts` via `lib/catalog.ts`): 12 documented projects drawn from the public `VeTwo-dev` GitHub org profile and repository READMEs, each with an explicit source and last-updated date.
- Ecosystem relationships are manifest-verified: `lib/ecosystem/graph.ts` records the three confirmed runtime dependency edges; conceptual layering is labeled as conceptual, never as a dependency.
- Registry status is verified against npm; only verified mappings appear in `NPM_PACKAGE_MAP` (5 published packages), with documented-but-unpublished packages flagged and withheld.
- The site is bilingual: English canonical, Arabic summaries/UI strings, correct RTL, PNU for Arabic and Inter (+ selective Roboto Mono) for English.
- Content is served by a Next.js 16 App Router site; public reads go through `/api/v1/public/*`. Lakebase Postgres (via Neon, branch `production`) plus S3-compatible object storage are auxiliary server-only services; catalog data itself is static.

## Capabilities and Constraints

- Read-only public site. No admin dashboard, roles, or CMS — `/api/v1/admin/*` is reserved and unimplemented.
- Public API contract `/api/v1/public/*` (`projects`, `projects/[slug]`, `packages`, `health`) exposes an allow-listed envelope `{data, meta}`; changes must remain additive and preserve shapes. All access is server-side.
- Evidence rule is binding: any field without direct evidence renders as "Unknown"; no fabricated metrics, statuses, velocity, or links. Static / cached / simulated data are labeled distinctly.
- Bilingual EN/AR is a first-class requirement; English is canonical with Arabic summaries and full RTL support. Never apply letter-spacing to Arabic text.
- Stack is fixed by the existing codebase: Next.js 16, React 19, Tailwind v4, TypeScript 6.0.3, Bun 1.4; shadcn/ui foundations (style `new-york`, base `radix`). Checks: `bun run lint && bun run typecheck && bun run test && bun run build`.
- Undecided products facts (do not invent): production hosting, analytics provider/consent jurisdiction, external-metadata automation, and a working private security-contact path.

## Brand Commitments

- Name **VeTwo**; canonical domain **vetwo.dev**.
- Official tagline: **"Revolutionizing Veterinary care through Engineering & Code"**.
- Organization bio: "Bridging the gap between Veterinary Medicine & Advanced Technology".
- The VeTwo name and the official electronic horse-head logo are protected brand assets; code is open source under its repository licenses, the brand is not. Official logo files are not vendored — an interim abstract mark (`public/icon.svg`) stands in and must never be presented as official.
- Bilingual identity is part of the brand, not a translation afterthought.

## Evidence on Hand

- `docs/repository-audit.md`, `docs/ecosystem-audit.md`, `docs/catalog.md`, `docs/decisions.md` — audited facts, decision register, and correction history.
- `lib/projects/data.ts` — editorial catalog with per-project source and `updatedAt`.
- `lib/ecosystem/graph.ts` — three manifest-verified runtime edges.
- `lib/external/npm.ts` — `NPM_PACKAGE_MAP` (5 verified published packages).
- 12 upstream repository READMEs/manifests fetched from `github.com/VeTwo-dev` (per ecosystem audit).

Do not fabricate the following, which are absent or unverified today: official logo variants (dark/SVG/favicon/apple-touch), the contact identities `@vetwo_dev` and `security@vetwo.dev`, per-project license/version/changelog/test/troubleshooting data, real user-supplied media (four homepage slots are placeholders), and any operational metric.

## Product Principles

1. **Evidence over assertion.** Every claim is sourced or labeled; absence renders as "Unknown", never a plausible guess.
2. **Scientific correctness is the differentiator.** Present the dimensional/units rigor that makes VeTwo distinct, and never misrepresent relationships as verified when they are conceptual.
3. **Small, focused, composable packages.** Communicate the one-responsibility-per-package ecosystem rather than an undifferentiated product.
4. **Open code, protected identity.** Freely reusable code, deliberately guarded VeTwo name and horse-head artwork.
5. **Bilingual parity is non-negotiable.** Arabic and RTL receive first-class treatment equal to English, canonically and visually.

## Accessibility & Inclusion

Target WCAG 2.2 AA throughout, aiming for AAA contrast on normal text where practical. Required: visible keyboard focus, reduced-motion support, touch targets of at least 44×44px where appropriate, no unintended horizontal overflow, semantic structure, and correct Arabic typography with RTL layout.
