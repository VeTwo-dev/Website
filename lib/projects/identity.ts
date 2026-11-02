import { PROJECTS } from "./data";

export const GITHUB_OWNER = "VeTwo-dev";
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]?$/;

/** Canonical slug form: lowercase, trimmed, single dashes. */
export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

/** Throws on duplicate slugs. Run at seed time and in tests. */
export function assertUniqueSlugs(slugs: string[]): void {
  const seen = new Set<string>();
  for (const s of slugs) {
    if (seen.has(s)) throw new Error(`duplicate project slug: ${s}`);
    seen.add(s);
  }
}

export type GitHubRef = { owner: string; repo: string };

/**
 * Parse a repository URL into an {owner, repo} ref.
 * Returns null for non-GitHub or malformed URLs — never throws on user input.
 * Mismatched owners are NOT silently remapped; callers must pass an allow-list.
 */
export function parseGitHubRef(url: string): GitHubRef | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || u.hostname !== "github.com") return null;
    const [owner, repo] = u.pathname.split("/").filter(Boolean);
    if (!owner || !repo) return null;
    return { owner, repo: repo.replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

/** Editorial slug → verified GitHub repo name. Built from the catalog itself. */
export function editorialRepoMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of PROJECTS) {
    const ref = parseGitHubRef(p.repository);
    if (ref && ref.owner === GITHUB_OWNER) map.set(p.slug, ref.repo);
  }
  return map;
}
