import { z } from "zod";
import { fetchJsonCapped } from "./github";

/**
 * Verified slug → published npm package mapping.
 * Evidence: registry probes 2026-10-09/12 (200 for these, 404 for the rest).
 * Slugs WITHOUT a verified published package are intentionally absent:
 * feed-formulation, vetwo-market-place, docs, units-manager, cli,
 * marketplace-fetch-pack, cli-sound. The unscoped `cli-sound@1.1.3` on npm
 * is NOT verifiably VeTwo's (repo manifest names `@vetwo/cli-sound`,
 * unpublished there; registry entry has no repository field) — excluded.
 * Never invent install commands for unmapped slugs.
 */
export const NPM_PACKAGE_MAP: Record<string, string> = {
  units: "@vetwo/units",
  "nutrition-units": "@vetwo/nutrition-units",
  whichenv: "@vetwo/whichenv",
  "repo-fetch": "@vetwo/repo-fetch",
  "create-vetwo-pack": "create-vetwo-pack",
};

const NpmAbbrevDoc = z.object({
  name: z.string().max(214),
  description: z.string().max(500).nullable().optional(),
  license: z.string().max(60).nullable().optional(),
  "dist-tags": z.object({ latest: z.string().max(40) }).passthrough(),
  time: z.record(z.string(), z.string()).optional(),
});

export type NpmPackageMeta = {
  name: string;
  version: string;
  registryUrl: string;
  publishedAt: string | null;
  license: string | null;
};

/**
 * Fetch published metadata for one package. `name` must come from
 * NPM_PACKAGE_MAP (never raw user input).
 */
export async function fetchNpmPackageMeta(
  name: string,
): Promise<{ ok: true; meta: NpmPackageMeta } | { ok: false; failure: { kind: "timeout" | "http" | "invalid" | "network" | "not_public"; status?: number } }> {
  if (!/^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name)) {
    return { ok: false, failure: { kind: "invalid" } };
  }
  const url = `https://registry.npmjs.org/${name}`;
  const res = await fetchJsonCapped(url, {
    headers: { Accept: "application/vnd.npm.install-v1+json" },
  });
  if (!res.ok) return res;
  const parsed = NpmAbbrevDoc.safeParse(res.json);
  if (!parsed.success) return { ok: false, failure: { kind: "invalid" } };
  const d = parsed.data;
  const version = d["dist-tags"].latest;
  return {
    ok: true,
    meta: {
      name: d.name,
      version,
      registryUrl: `https://www.npmjs.com/package/${d.name}`,
      publishedAt: d.time?.[version] ?? null,
      license: d.license ?? null,
    },
  };
}
