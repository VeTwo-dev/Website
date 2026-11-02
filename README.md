# VeTwo Website

Official public website for **VeTwo** — `https://vetwo.dev`.

> Revolutionizing Veterinary care through Engineering & Code.

Bilingual (English/Arabic), dark technical aesthetic, evidence-driven project catalog. No fabricated metrics: unverified fields render as **Unknown**, cached data carries timestamps, simulations are labeled.

## Requirements

- [Bun](https://bun.sh) >= 1.4.0 (package manager + runtime; see `packageManager` field and `bun.lock`)

## Quickstart

```bash
bun install
bun run tokens
bun run dev        # http://localhost:3000/en
```

Optional services (all safe to skip — site degrades to static catalog):

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_PLAUSIBLE_DOMAIN as needed (all service vars optional)
```

## Checks

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

## Docs

- `docs/repository-audit.md` — Phase 1 forensics + architecture
- `docs/decisions.md` — confirmed vs unresolved decisions
- `docs/logo-inventory.md` — official asset gap + plan
- `docs/mongodb.md` — persistence strategy
- `docs/security.md` — baseline + risks
- `docs/analytics.md` — privacy-friendly plan
- `ASSETS.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`
