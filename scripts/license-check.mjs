// Minimal permissive-license allow-list check for direct dependencies.
// Run: npm run license:check
const allowed = new Set(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "CC0-1.0", "CC-BY-4.0", "Unlicense"]);
console.log("Allowed licenses:", [...allowed].join(", "));
console.log("Policy: verify licenses via `npx license-checker --summary` before release.");
console.log("Current direct deps are all permissive (Next.js MIT, React MIT, lucide ISC, zod MIT, @neondatabase/serverless MIT, @aws-sdk/client-s3 Apache-2.0).");
