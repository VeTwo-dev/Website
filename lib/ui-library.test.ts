import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      sourceFiles(full, out);
    } else if (/\.(tsx?|mjs)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("UI library state (Path A: no migration in progress)", () => {
  it("has no Radix/Base primitive imports in app or component source", () => {
    const hits: string[] = [];
    for (const dir of ["app", "components"].map((d) => path.join(ROOT, d))) {
      for (const file of sourceFiles(dir)) {
        const text = fs.readFileSync(file, "utf8");
        if (/@radix-ui\/(?!react-slot)|@base-ui\//.test(text)) hits.push(path.relative(ROOT, file));
      }
    }
    expect(hits).toEqual([]);
  });

  it("declares a known shadcn base and the configured icon library", () => {
    const config = JSON.parse(fs.readFileSync(path.join(ROOT, "components.json"), "utf8")) as {
      base?: string;
      iconLibrary?: string;
    };
    // `base` is absent on disk; `shadcn info` resolves the default ("radix").
    // An explicit "base" value would take precedence when present.
    expect(["radix", "base", undefined]).toContain(config.base);
    expect(config.iconLibrary).toBe("lucide");
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };
    expect(pkg.dependencies?.["lucide-react"]).toBeTruthy();
    expect(pkg.dependencies?.["@tabler/icons-react"]).toBeUndefined();
  });
});
