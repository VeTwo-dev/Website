/**
 * Verified install commands. Every entry is quoted from the project's own
 * README (see docs/ecosystem-audit.md). Slugs without a verified command are
 * absent — callers must render the unverified-install fallback instead.
 */
export const INSTALL_COMMANDS: Record<string, { command: string; source: string }[]> = {
  units: [
    { command: "npm install @vetwo/units", source: "https://github.com/VeTwo-dev/units#installation" },
  ],
  "nutrition-units": [
    { command: "npm install @vetwo/units @vetwo/nutrition-units", source: "https://github.com/VeTwo-dev/nutrition-units#installation" },
  ],
  "repo-fetch": [
    { command: "npm install @vetwo/repo-fetch", source: "https://github.com/VeTwo-dev/Repo-Fetch#installation" },
  ],
  whichenv: [
    { command: "npx whichenv", source: "https://github.com/VeTwo-dev/whichenv#quick-start" },
  ],
};
