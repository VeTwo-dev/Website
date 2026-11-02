import { z } from "zod";

export const ProjectStatus = z.enum(["Active", "Stable", "Beta", "Maintenance", "Deprecated", "Unknown"]);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

export const ProjectCategory = z.enum([
  "VetTech",
  "IoT",
  "Scientific",
  "Calculator",
  "DeveloperTool",
  "Infrastructure",
  "Documentation",
]);
export type ProjectCategory = z.infer<typeof ProjectCategory>;

/**
 * Editorial project record. Only fields with verified evidence may be filled;
 * everything else stays `null` (unknown) — never invent versions/licenses/stars.
 */
export const ProjectSchema = z.object({
  slug: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  descriptionAr: z.string().max(500).optional(),
  category: ProjectCategory,
  status: ProjectStatus,
  statusReason: z.string().max(300),
  technologies: z.array(z.string().max(40)).max(12),
  repository: z.string().url(),
  docs: z.string().url().nullable(),
  packageRegistry: z.string().url().nullable(),
  license: z.string().max(40).nullable(),
  version: z.string().max(40).nullable(),
  featured: z.boolean().default(false),
  dataKind: z.enum(["static"]).default("static"),
  source: z.string().max(200),
  updatedAt: z.string().max(40),
  /**
   * Evidence-backed capability highlights (README-sourced). Empty when the
   * project has no verified documentable capabilities — section omitted.
   */
  highlights: z.array(z.string().max(120)).max(4).default([]),
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectQuerySchema = z.object({
  q: z.string().max(100).optional().default(""),
  category: z.string().max(40).optional().default("all"),
  status: z.string().max(40).optional().default("all"),
  view: z.enum(["grid", "list"]).optional().default("grid"),
  limit: z.coerce.number().int().min(1).max(50).optional().default(24),
  page: z.coerce.number().int().min(1).max(100).optional().default(1),
  sort: z.enum(["slug", "name_asc", "name_desc"]).optional().default("slug"),
});

export type ProjectQuery = z.infer<typeof ProjectQuerySchema>;
