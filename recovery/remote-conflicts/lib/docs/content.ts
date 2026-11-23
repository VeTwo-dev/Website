/**
 * Documentation catalog. Hand-authored static content (the established
 * convention — no MDX engine, no generator). Every install command and code
 * example is quoted from a verified source named in the article; anything
 * unverified is labeled, never invented.
 */

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "code"; lang: string; code: string; source: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; tone: "info" | "warning" | "danger"; text: string }
  | { type: "table"; head: [string, string]; rows: [string, string][] };

export type ArticleSection = "start" | "quickstart" | "api" | "architecture";

export type Article = {
  slug: string;
  section: ArticleSection;
  title: string;
  titleAr: string;
  summaryAr: string;
  stability: "Stable" | "Experimental";
  /** Date this site page was last reviewed against its sources (not upstream currency). */
  reviewed: string;
  body: ArticleBlock[];
};

export const SECTIONS: { id: ArticleSection; title: string; titleAr: string }[] = [
  { id: "start", title: "Getting started", titleAr: "البداية" },
  { id: "quickstart", title: "Quickstarts", titleAr: "بدء سريع" },
  { id: "api", title: "API references", titleAr: "مرجع الواجهات" },
  { id: "architecture", title: "Architecture", titleAr: "البنية" },
];

export const ARTICLES: Article[] = [
  {
    slug: "getting-started",
    section: "start",
    title: "Getting started",
    titleAr: "البداية",
    summaryAr: "كيف تتناسق المنظومة وأين تبدأ.",
    stability: "Stable",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "VeTwo is a collection of small, focused TypeScript packages: a units engine, a nutrition domain layer, applications like Feed-Formulation, and developer infrastructure (whichenv, Repo-Fetch, Docs, Market-Place)." },
      { type: "p", text: "Start from the GitHub organization (verified: https://github.com/VeTwo-dev), pick one package, and read its repository README — this site never substitutes its own install commands for the repo source of truth." },
    ],
  },
  {
    slug: "units-engine",
    section: "start",
    title: "Units engine concept",
    titleAr: "مفهوم محرك الوحدات",
    summaryAr: "لماذا mg/kg ≠ % وكيف يمنع التحليل البعدي العلم غير الصحيح.",
    stability: "Stable",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "The units package is a dependency-free dimensional-analysis engine: every unit is a vector of exponents over five base dimensions (Mass, Time, Energy, Currency, Count), so units that cannot be mathematically combined must never silently produce a valid-looking result." },
      { type: "p", text: "Canonical example from the ecosystem README: mg/kg ≠ %. Treat this page as conceptual until per-package API docs are verified against source — see the units API reference for verified exports." },
    ],
  },
  {
    slug: "feed-formulation",
    section: "start",
    title: "Feed formulation",
    titleAr: "تركيب الأعلاف",
    summaryAr: "قواعد التغذية المبنية على محرك الوحدات. تجريبي حتى تُوثّق الصيغ.",
    stability: "Experimental",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "Nutrition-units builds feed-formulation rules on top of @vetwo/units. No validated scientific formulas or units tables are published on this site yet." },
      { type: "callout", tone: "warning", text: "Experimental: any calculator shown here must cite validated formulas with explicit units, or be labeled an illustrative demo — never an authoritative calculator." },
    ],
  },
  {
    slug: "hardware",
    section: "start",
    title: "Hardware notes",
    titleAr: "ملاحظات العتاد",
    summaryAr: "لا توجد أدلة توصيل موثّقة بعد.",
    stability: "Experimental",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "No verified wiring guides, gateway counts, or telemetry endpoints are published. IoT demos on this site are simulated and labeled as such." },
      { type: "callout", tone: "danger", text: "No live farm telemetry exists on this site. Simulated values are always labeled simulated and never represent real hardware." },
    ],
  },
  {
    slug: "quickstart-units",
    section: "quickstart",
    title: "Quickstart: units",
    titleAr: "بدء سريع: units",
    summaryAr: "تثبيت محرك الوحدات وأول مثال موثّق.",
    stability: "Stable",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "Prerequisite: Node.js 20+ (the package ships ESM with a CJS fallback). Install from the verified published package @vetwo/units — command quoted verbatim from the repository README:" },
      { type: "code", lang: "bash", code: "npm install @vetwo/units\n# or\nbun add @vetwo/units", source: "https://github.com/VeTwo-dev/units#installation" },
      { type: "p", text: "Minimal working example, quoted from the README. One generic operation handles percent, ppm, mg/kg and other ratio/rate units:" },
      { type: "code", lang: "ts", code: 'import { Quantity } from "@vetwo/units";\n\nconst cp = Quantity.of(12, "%");\nconst intake = Quantity.of(10, "kg/day");\n\nintake.multiply(cp).to("g/day"); // Quantity(1200, "g/day")', source: "https://github.com/VeTwo-dev/units" },
      { type: "p", text: "Test and build instructions for this package are not published in an observed source; run the repository scripts after cloning. Further documentation: the units API reference on this site and the repository README." },
    ],
  },
  {
    slug: "quickstart-nutrition-units",
    section: "quickstart",
    title: "Quickstart: nutrition-units",
    titleAr: "بدء سريع: nutrition-units",
    summaryAr: "تثبيت طبقة التغذية وأول مثال موثّق.",
    stability: "Stable",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "Prerequisite: @vetwo/units (installed automatically as a manifest dependency, ^0.0.1). Install command quoted verbatim from the repository README:" },
      { type: "code", lang: "bash", code: "npm install @vetwo/units @vetwo/nutrition-units\n# or\nbun add @vetwo/units @vetwo/nutrition-units", source: "https://github.com/VeTwo-dev/nutrition-units#installation" },
      { type: "p", text: "Minimal working example, quoted from the README. No /100, no *1000, no manual unit math in application code:" },
      { type: "code", lang: "ts", code: 'import { Quantity } from "@vetwo/units";\nimport { nutritionMath } from "@vetwo/nutrition-units";\n\nconst cp = Quantity.of(12, "%");             // crude protein, as-fed\nconst intake = Quantity.of(10, "kg/day");    // feed intake\n\nnutritionMath.calculate(intake, cp, "cp");   // Quantity(1200, "g/day")', source: "https://github.com/VeTwo-dev/nutrition-units" },
      { type: "p", text: "The package turns unit-safe math into plain numbers an LP solver (HiGHS or any other) can consume. Solver setup itself is outside this quickstart — see the repository README." },
    ],
  },
  {
    slug: "quickstart-whichenv",
    section: "quickstart",
    title: "Quickstart: whichenv",
    titleAr: "بدء سريع: whichenv",
    summaryAr: "تشغيل محرك استخبارات المشاريع بدون تثبيت.",
    stability: "Stable",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "No installation needed for the documented commands — npx resolves the verified published package @vetwo/whichenv. Commands quoted from the repository README:" },
      { type: "code", lang: "bash", code: "# Interactive wizard\nnpx whichenv\n\n# Detect and print results\nnpx whichenv detect\n\n# Run diagnostics\nnpx whichenv doctor", source: "https://github.com/VeTwo-dev/whichenv#quick-start" },
      { type: "p", text: "Programmatic use, quoted from the README:" },
      { type: "code", lang: "ts", code: 'import { detectProject } from "@vetwo/whichenv";\n\nconst project = await detectProject();', source: "https://github.com/VeTwo-dev/whichenv#quick-start" },
      { type: "p", text: "Network access is required for npx on first run. Export formats (JSON, Markdown, HTML, YAML, CSV, Mermaid, Graphviz) are documented in the repository README." },
    ],
  },
  {
    slug: "quickstart-repo-fetch",
    section: "quickstart",
    title: "Quickstart: repo-fetch",
    titleAr: "بدء سريع: repo-fetch",
    summaryAr: "تثبيت أداة الجلب الجزئي من المستودعات.",
    stability: "Stable",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "Install from the verified published package @vetwo/repo-fetch — variants quoted verbatim from the repository README:" },
      { type: "code", lang: "bash", code: "# npm\nnpm install @vetwo/repo-fetch\n\n# pnpm\npnpm add @vetwo/repo-fetch\n\n# yarn\nyarn add @vetwo/repo-fetch", source: "https://github.com/VeTwo-dev/Repo-Fetch#installation" },
      { type: "p", text: "The library downloads only selected files from a Git repository — it never clones. CLI usage and interactive browsing are documented in the repository README." },
    ],
  },
  {
    slug: "api-units",
    section: "api",
    title: "API reference: units",
    titleAr: "مرجع الواجهة: units",
    summaryAr: "الصادرات العامة الموثّقة لحزمة units.",
    stability: "Stable",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "Verified public exports, named by the repository README API reference section. Signatures are not reproduced here — read them in source:" },
      { type: "list", items: ["Quantity — core value type supporting multiply, divide, add, subtract, and convert with dimensional safety", "Q() factory — shorthand constructor documented in the README", "parseUnit() — parses unit expressions", "UnitRegistry — registry of known units"] },
      { type: "p", text: "Source of truth: https://github.com/VeTwo-dev/units#api-reference. Internal files are not public API and are not enumerated here." },
    ],
  },
  {
    slug: "api-nutrition-units",
    section: "api",
    title: "API reference: nutrition-units",
    titleAr: "مرجع الواجهة: nutrition-units",
    summaryAr: "الصادرات العامة الموثّقة لحزمة nutrition-units.",
    stability: "Stable",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "Verified public exports, named by the repository README API reference section. The package contains zero generic unit-conversion logic — that lives in @vetwo/units; it adds nutrition vocabulary only:" },
      { type: "list", items: ["NutritionMath (nutritionMath) — domain calculations such as calculate(intake, nutrient, key)", "CoefficientResolver — resolves nutrition coefficients", "BasisConverter — as-fed / dry-matter basis conversion", "TargetUnitRegistry — per-nutrient reporting units", "FeedSchemaLoader — reads feed/animal JSON schemas into safe Quantity values"] },
      { type: "p", text: "Source of truth: https://github.com/VeTwo-dev/nutrition-units#api-reference. Internal files are not public API and are not enumerated here." },
    ],
  },
  {
    slug: "architecture",
    section: "architecture",
    title: "Ecosystem architecture",
    titleAr: "بنية المنظومة",
    summaryAr: "الطبقات والاعتماديات الموثّقة من الملفات.",
    stability: "Stable",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "Layer 0 (foundation): units — dependency-free dimensional analysis. Layer 1 (domain and tools): nutrition-units builds on @vetwo/units; repo-fetch and whichenv are standalone tools. Layer 2 (composition): marketplace-fetch-pack composes @vetwo/repo-fetch; Create-VeTwo-Pack composes @vetwo/whichenv; Feed-Formulation is a standalone application with no observed VeTwo manifest dependencies." },
      { type: "p", text: "The three runtime edges above are verified in package manifests (see the ecosystem explorer for evidence links). Broader layering intent comes from the organization profile and is labeled conceptual, not dependency." },
    ],
  },
  {
    slug: "packages",
    section: "architecture",
    title: "Packages & verification policy",
    titleAr: "الحزم وسياسة التوثيق",
    summaryAr: "أي الحزم منشورة وكيف نتحقق منها.",
    stability: "Stable",
    reviewed: "2026-10-12",
    body: [
      { type: "p", text: "Published and registry-verified: @vetwo/units, @vetwo/nutrition-units, @vetwo/whichenv, @vetwo/repo-fetch, create-vetwo-pack. Repository-only (no verified registry entry): Feed-Formulation, VeTwo-Market-Place, Docs, Units-manager, Cli, marketplace-fetch-pack, cli-sound." },
      { type: "table", head: ["Project", "Registry status"], rows: [
        ["units", "@vetwo/units — published"],
        ["nutrition-units", "@vetwo/nutrition-units — published"],
        ["whichenv", "@vetwo/whichenv — published"],
        ["repo-fetch", "@vetwo/repo-fetch — published"],
        ["create-vetwo-pack", "create-vetwo-pack — published"],
        ["cli-sound", "unverified — no install commands shown"],
        ["docs", "repository only"],
        ["marketplace-fetch-pack", "repository only — @vetwo/marketplace unpublished"],
        ["feed-formulation", "repository only"],
        ["vetwo-market-place", "repository only"],
        ["units-manager", "repository only"],
        ["cli", "repository only"],
      ] },
      { type: "p", text: "Policy: install commands appear only for registry-verified packages with README-quoted commands. Unscoped cli-sound on npm is excluded — it is not verifiably VeTwo's. Publication timestamps come from the abbreviated registry endpoint when available, otherwise Unknown." },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** Project slug → doc article slugs shown in the detail Resources card. */
export const DOC_RESOURCES: Record<string, string[]> = {
  units: ["quickstart-units", "api-units"],
  "nutrition-units": ["quickstart-nutrition-units", "api-nutrition-units"],
  whichenv: ["quickstart-whichenv"],
  "repo-fetch": ["quickstart-repo-fetch"],
};

export function articlesBySection(section: ArticleSection): Article[] {
  return ARTICLES.filter((a) => a.section === section);
}
