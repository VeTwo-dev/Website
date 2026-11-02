import { ARTICLES } from "../docs/content";
import { PROJECTS } from "../projects/data";

/**
 * Lightweight local search index over actually-indexed content.
 * Scope: 12 project records (EN + AR summaries) + all doc articles (EN body).
 * No external calls, no query text leaves the browser (see analytics audit).
 */

export type SearchEntry = {
  id: string;
  kind: "project" | "doc";
  title: string;
  excerpt: string;
  href: string;
};

export function buildIndex(locale: "en" | "ar"): SearchEntry[] {
  const docs: SearchEntry[] = ARTICLES.map((a) => ({
    id: `doc:${a.slug}`,
    kind: "doc",
    title: locale === "ar" ? a.titleAr : a.title,
    excerpt: locale === "ar"
      ? a.summaryAr
      : a.body.filter((b) => b.type === "p").map((b) => (b.type === "p" ? b.text : "")).join(" ").slice(0, 160),
    href: `/${locale}/docs/${a.slug}`,
  }));
  const projects: SearchEntry[] = PROJECTS.map((p) => ({
    id: `project:${p.slug}`,
    kind: "project",
    title: p.name,
    excerpt: locale === "ar" && p.descriptionAr ? p.descriptionAr : p.description,
    href: `/${locale}/projects/${p.slug}`,
  }));
  return [...projects, ...docs];
}

export function searchIndex(entries: SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  return entries
    .filter((e) => `${e.title} ${e.excerpt}`.toLowerCase().includes(needle))
    .slice(0, Math.min(Math.max(limit, 1), 20));
}
