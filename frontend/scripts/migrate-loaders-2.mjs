#!/usr/bin/env node
/**
 * Audit + migrate remaining `animate-spin` spinners to <ButtonLoader />.
 *
 * Pass 1 (audit): print every remaining animate-spin occurrence with context,
 * so we can see the exact shapes the first script's regexes missed.
 * Pass 2 (migrate): apply a broader set of replacements, ensure the import.
 *
 * Re-runnable. Usage: node scripts/migrate-loaders-2.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(__dirname, "..");
const IMPORT_LINE = 'import { ButtonLoader } from "@/components/brand-loader";';

// Recursively collect .tsx files under app/ and components/.
function collect(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) collect(p, out);
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const files = [
  ...collect(join(FRONTEND, "app")),
  ...collect(join(FRONTEND, "components")),
];

// ---- PASS 1: AUDIT ----
console.log("======== AUDIT: remaining `animate-spin` occurrences ========");
let auditCount = 0;
for (const abs of files) {
  const src = readFileSync(abs, "utf8");
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    if (line.includes("animate-spin")) {
      auditCount++;
      const rel = relative(FRONTEND, abs).replace(/\\/g, "/");
      const ctx = lines.slice(Math.max(0, i - 2), i + 3).join("\n");
      console.log(`\n--- ${rel}:${i + 1} ---\n${ctx}`);
    }
  });
}
console.log(`\n>>> Total animate-spin lines remaining: ${auditCount}\n`);

// ---- PASS 2: MIGRATE ----
// Broader matchers covering the shapes seen across the codebase.
const REPLACERS = [
  // Hand-rolled <svg className="... animate-spin ...">...</svg>
  { re: /<svg\s+className="[^"]*\banimate-spin\b[^"]*"[\s\S]*?<\/svg>/g, to: "<ButtonLoader />" },
  // Self-closing <Loader2 ... animate-spin ... />
  { re: /<Loader2\b[^>]*\banimate-spin\b[^>]*\/>/g, to: "<ButtonLoader />" },
  // <Loader2 ... animate-spin ...></Loader2>
  { re: /<Loader2\b[^>]*\banimate-spin\b[^>]*>\s*<\/Loader2>/g, to: "<ButtonLoader />" },
];

console.log("======== MIGRATE ========");
let changed = 0;
for (const abs of files) {
  let src = readFileSync(abs, "utf8");
  const before = src;
  for (const { re, to } of REPLACERS) src = src.replace(re, to);
  if (src === before) continue;

  // Ensure import present.
  if (!src.includes("@/components/brand-loader")) {
    const lines = src.split("\n");
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*import\s.+from\s+["'].+["'];?\s*$/.test(lines[i])) lastImport = i;
    }
    if (lastImport >= 0) {
      lines.splice(lastImport + 1, 0, IMPORT_LINE);
      src = lines.join("\n");
    }
  } else if (!/\bButtonLoader\b/.test(src.split("\n").filter(l => l.includes("brand-loader")).join(""))) {
    src = src.replace(
      /import\s*\{([^}]*)\}\s*from\s*"@\/components\/brand-loader";/,
      (m, inner) => `import {${inner.replace(/\s+$/, "")}, ButtonLoader } from "@/components/brand-loader";`,
    );
  }

  writeFileSync(abs, src, "utf8");
  console.log(`UPDATED: ${relative(FRONTEND, abs).replace(/\\/g, "/")}`);
  changed++;
}
console.log(`\nDone. ${changed} file(s) updated in migrate pass.`);
