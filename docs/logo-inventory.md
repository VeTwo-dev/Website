# Official Logo Inventory

Source of truth searched: this repo (`public/`, `app/`, `assets/`), README, git history (1 commit).

| Required asset | Status in this repo | Notes |
|---|---|---|
| Dark-background logo variant | MISSING | — |
| SVG master | MISSING | Interim `public/icon.svg` is abstract placeholder, NOT official |
| Raster web-size variants | MISSING | — |
| favicon.ico | MISSING (uses interim SVG) | Browsers fall back to `/icon.svg` |
| Apple touch icon 180×180 | MISSING | Manifest references it; add when brand provides |
| Web manifest icons (192/512) | MISSING | Add when brand provides |
| Safe-area / clearspace spec | UNKNOWN | Derive from actual logo file when received |

External reference (not vendored): `VeTwo-dev/VeTwo-dev` repo `assets/logo/Logo.png` + org avatar — observed via org profile fetch 2026-10-09. Do NOT hotlink or copy without license confirmation.

## Asset plan

1. Request official SVG master + dark variant + raster exports + license/usage terms from brand owner.
2. Replace `components/logo.tsx` + `public/icon.svg`, add `favicon.ico`, `apple-touch-icon.png`, `icon-192/512.png`, update `app/manifest.ts`.
3. Record provenance + license in `ASSETS.md`.
