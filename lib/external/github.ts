import { z } from "zod";
import { GITHUB_OWNER } from "../projects/identity";

export const FETCH_TIMEOUT_MS = 8000;
export const MAX_BODY_BYTES = 256 * 1024;

/** Minimal shape of the GitHub REST repo response. Unknown fields ignored. */
const GitHubRepoResponse = z.object({
  full_name: z.string(),
  private: z.boolean(),
  html_url: z.string().url(),
  stargazers_count: z.number().int().nonnegative(),
  forks_count: z.number().int().nonnegative(),
  open_issues_count: z.number().int().nonnegative(),
  pushed_at: z.string().nullable().optional(),
  default_branch: z.string().max(100).nullable().optional(),
  license: z.object({ spdx_id: z.string().max(40) }).nullable().optional(),
});

export type GitHubRepoMeta = {
  fullName: string;
  url: string;
  stars: number;
  forks: number;
  openIssues: number;
  license: string | null;
  pushedAt: string | null;
  defaultBranch: string | null;
};

export type FetchFailure =
  | { kind: "timeout" }
  | { kind: "http"; status: number }
  | { kind: "invalid" }
  | { kind: "not_public" }
  | { kind: "network" };

/** Server-only fetch with timeout + size cap. `init` is fixed by the caller. */
export async function fetchJsonCapped(url: string, init?: RequestInit): Promise<{ ok: true; json: unknown } | { ok: false; failure: FetchFailure; status?: number }> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (e) {
    return { ok: false, failure: { kind: e instanceof Error && e.name === "TimeoutError" ? "timeout" : "network" } };
  }
  if (res.status === 404) return { ok: false, failure: { kind: "http", status: 404 }, status: 404 };
  if (res.status === 403 || res.status === 429) return { ok: false, failure: { kind: "http", status: res.status }, status: res.status };
  if (!res.ok) return { ok: false, failure: { kind: "http", status: res.status }, status: res.status };
  const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.includes("application/json") && !contentType.includes("+json")) {
    return { ok: false, failure: { kind: "invalid" } };
  }
  try {
    const text = await res.text();
    if (text.length > MAX_BODY_BYTES) return { ok: false, failure: { kind: "invalid" } };
    return { ok: true, json: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, failure: { kind: "invalid" } };
  }
}

function tokenHeader(): Record<string, string> {
  // Server-side only. Never serialized into API responses (see service.ts).
  const token = process.env.GITHUB_TOKEN ?? "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch public metadata for one repo under the fixed VeTwo-dev owner.
 * `repo` must come from the editorial allow-list (never raw user input).
 */
export async function fetchGitHubRepoMeta(
  repo: string,
): Promise<{ ok: true; meta: GitHubRepoMeta } | { ok: false; failure: FetchFailure }> {
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(repo)) return { ok: false, failure: { kind: "invalid" } };
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${repo}`;
  const res = await fetchJsonCapped(url, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "vetwo-website", ...tokenHeader() },
  });
  if (!res.ok) return res;
  const parsed = GitHubRepoResponse.safeParse(res.json);
  if (!parsed.success) return { ok: false, failure: { kind: "invalid" } };
  const r = parsed.data;
  if (r.private) return { ok: false, failure: { kind: "not_public" } };
  const license = r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null;
  return {
    ok: true,
    meta: {
      fullName: r.full_name,
      url: r.html_url,
      stars: r.stargazers_count,
      forks: r.forks_count,
      openIssues: r.open_issues_count,
      license,
      pushedAt: r.pushed_at ?? null,
      defaultBranch: r.default_branch ?? null,
    },
  };
}
