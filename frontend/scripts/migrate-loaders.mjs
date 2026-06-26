#!/usr/bin/env node
/**
 * One-shot migration: replace raw `animate-spin` spinners across the app with
 * the branded <ButtonLoader /> from "@/components/brand-loader", and ensure the
 * import exists in each touched file.
 *
 * Safe to re-run (idempotent): files already migrated are skipped.
 *
 * Usage:  node scripts/migrate-loaders.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(__dirname, "..");

// Files known to contain raw spinners (from grep audit).
const TARGETS = [
  "app/login/page.tsx",
  "app/signup/page.tsx",
  "app/reset-password/page.tsx",
  "app/settings/page.tsx",
  "app/organize-pdf/organize-pdf-client.tsx",
  "app/add-watermark/add-watermark-client.tsx",
  "app/jpg-to-pdf/jpg-to-pdf-client.tsx",
  "app/split-pdf/split-pdf-client.tsx",
  "app/page-numbering/page-numbering-client.tsx",
  "app/word-to-pdf/word-to-pdf-client.tsx",
  "app/pdf-to-excel/pdf-to-excel-client.tsx",
  "app/excel-to-pdf/excel-to-pdf-client.tsx",
  "app/pdf-to-word/pdf-to-word-client.tsx",
  "components/tools/compress-pdf-tool.tsx",
  "components/tools/merge-pdf-tool.tsx",
  "components/ai/ai-tools-section.tsx",
];

const IMPORT_LINE = 'import { ButtonLoader } from "@/components/brand-loader";';

// The canonical hand-rolled spinner SVG used across auth pages. Matched loosely
// on whitespace so minor indentation differences still hit.
const SVG_SPINNER_RE =
  /<svg\s+className="h-4 w-4 animate-spin"[\s\S]*?<\/svg>/g;

// A lucide <Loader2 ... className="... animate-spin ..." /> self-closing tag.
const LOADER2_RE =
  /<Loader2(\s+[^>]*?)?\s+className="([^"]*\banimate-spin\b[^"]*)"([^>]*?)\/>/g;

let changed = 0;
let skipped = 0;
const report = [];

for (const rel of TARGETS) {
  const abs = join(FRONTEND, rel);
  if (!existsSync(abs)) {
    report.push(`SKIP (missing): ${rel}`);
    continue;
  }
  let src = readFileSync(abs, "utf8");
  const before = src;

  // 1) Replace hand-rolled SVG spinners with <ButtonLoader />
  src = src.replace(SVG_SPINNER_RE, "<ButtonLoader />");

  // 2) Replace <Loader2 ... animate-spin ... /> with <ButtonLoader />
  src = src.replace(LOADER2_RE, "<ButtonLoader />");

  if (src === before) {
    report.push(`no-op: ${rel}`);
    skipped++;
    continue;
  }

  // 3) Ensure the ButtonLoader import is present.
  if (!src.includes("@/components/brand-loader")) {
    // Insert after the last existing top-of-file import line.
    const lines = src.split("\n");
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*import\s.+from\s+["'].+["'];?\s*$/.test(lines[i])) lastImport = i;
      // stop scanning once we hit the first non-import, non-comment, non-blank
      if (
        lastImport >= 0 &&
        lines[i].trim() &&
        !/^\s*import\s/.test(lines[i]) &&
        !/^\s*\/\//.test(lines[i]) &&
        !/^\s*["']use client["'];?/.test(lines[i])
      ) {
        break;
      }
    }
    if (lastImport >= 0) {
      lines.splice(lastImport + 1, 0, IMPORT_LINE);
      src = lines.join("\n");
    }
  } else if (!src.includes("ButtonLoader")) {
    // brand-loader is imported but not ButtonLoader — add it to that import.
    src = src.replace(
      /import\s*\{([^}]*)\}\s*from\s*"@\/components\/brand-loader";/,
      (m, inner) => `import {${inner.trimEnd()}, ButtonLoader } from "@/components/brand-loader";`,
    );
  }

  writeFileSync(abs, src, "utf8");
  report.push(`UPDATED: ${rel}`);
  changed++;
}

console.log(report.join("\n"));
console.log(`\nDone. ${changed} file(s) updated, ${skipped} unchanged.`);
console.log("Next: run `npx tsc --noEmit` and `npm run build` to verify.");
