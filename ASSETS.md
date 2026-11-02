# ASSETS.md

Provenance and licenses for visual/brand assets in this repo.

| Asset | Path | Provenance | License |
|---|---|---|---|
| Interim abstract mark (SVG) | `public/icon.svg`, `components/logo.tsx` | Original placeholder drawn for this repo; intentionally NOT the official horse-head | MIT (code) — replace with official art under brand terms |
| Design tokens | `tokens/design-tokens.json` | Specified in implementation brief | MIT |
| Orbitron (former English UI font) | `public/fonts/Orbitron/*` (files kept on disk, unreferenced) | The League of Orbitron, bundled `OFL.txt` | OFL-1.1; superseded by Inter, retained on disk only |
| Lato (former English body font) | `public/fonts/Lato/*` (files kept on disk, unreferenced) | tyPoland Łukasz Dziedzic, bundled `OFL.txt` | OFL-1.1; superseded by Inter, retained on disk only |
| Audiowide (former display font) | `public/fonts/Audiowide/Audiowide-Regular.ttf` (kept on disk, unreferenced) | Bundled `OFL.txt` | OFL-1.1; superseded by Inter display role, retained on disk only |
| Inter (English UI font) | `next/font/google`, weights 400/500/600/700, latin | Google Fonts, fetched at build, self-hosted at runtime | OFL-1.1 (SIL Open Font License); no browser requests to Google |
| Roboto Mono (technical font) | `next/font/google`, weights 400/500/600, latin | Google Fonts, fetched at build, self-hosted at runtime | Apache-2.0; selective code/identifier use only |
| PNU (Arabic UI font) | `public/fonts/PNU/PNU-{Light,Regular,Medium,Bold}.ttf` | Supplied project asset (`arbfonts.txt` pointer only) | **Unverified** — no license text found in repo; kept as-supplied, do not redistribute claims; confirm with maintainer |
| Lucide icons | npm `lucide-react` | ISC | ISC |

Official electronic horse-head logo: NOT vendored (see `docs/logo-inventory.md`). Do not treat the interim mark as official. Forks must replace protected branding and avoid implying endorsement.
