import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/",
    "node_modules/",
    "coverage/",
    ".agents/skills/",
    ".github/skills/",
    ".opencode/skills/",
    // Python/Jupyter environment mounted inside the repo root (bun, conda, etc.).
    // Not project source; eslint's default glob walks it and reports thousands of
    // third-party JS errors. Added 2026-10-29 after `bun run lint` reported 6331
    // problems, all of which were outside app/, components/, lib/, scripts/, tests/.
    "b5bf2e54cb654f7b/",
  ]),
]);
