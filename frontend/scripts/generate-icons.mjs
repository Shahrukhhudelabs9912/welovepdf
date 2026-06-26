#!/usr/bin/env node
// Generates the three PWA icons required by app/manifest.ts:
//   - public/icon-192.png          (192x192, purpose=any)
//   - public/icon-512.png          (512x512, purpose=any)
//   - public/icon-maskable-512.png (512x512, purpose=maskable)
//
// Design: white PDF document on a blue→purple gradient background
// (matching the website's CTA / features sections which use Tailwind
// from-blue-600 to-purple-600). A blue heart sits in the center of
// the document. Brand blue is #3b82f6 (matches manifest theme_color).
// The maskable variant uses a 60% logo area so the icon survives
// Android's circle/squircle/rounded-square masks.
//
// Usage: node scripts/generate-icons.mjs

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");

// Brand palette — matches Tailwind blue-600 → purple-600 used across
// components/home/cta.tsx and components/home/features.tsx, plus the
// primary blue defined in app/globals.css.
const BLUE = "#2563eb";       // tailwind blue-600
const BLUE_DARK = "#1d4ed8";  // tailwind blue-700
const PURPLE = "#9333ea";     // tailwind purple-600
const WHITE = "#ffffff";

// Build an SVG icon at the target canvas size.
//   logoScale: how much of the canvas the logo occupies.
//     - 1.0 = full bleed (purpose=any)
//     - 0.6 = leaves 20% padding on each side (purpose=maskable safe zone)
function buildSvg(size, logoScale) {
  const cornerRadius = Math.round(size * 0.22); // iOS-ish rounded square
  const logoSize = Math.round(size * logoScale);
  const logoOffset = Math.round((size - logoSize) / 2);

  // PDF document dimensions inside the logo area.
  // Aspect ratio ~0.77 (close to A4) — width 60% of logoSize, height 78%.
  const docW = Math.round(logoSize * 0.6);
  const docH = Math.round(logoSize * 0.78);
  const docX = logoOffset + Math.round((logoSize - docW) / 2);
  const docY = logoOffset + Math.round((logoSize - docH) / 2);

  // Folded corner triangle (top-right).
  const fold = Math.round(docW * 0.22);

  // Heart positioned in center of the doc.
  const heartW = Math.round(docW * 0.55);
  const heartH = Math.round(heartW * 0.9);
  const heartX = docX + Math.round((docW - heartW) / 2);
  const heartY = docY + Math.round(docH * 0.32);

  // Build a heart shape using a path. Standard heart curve, scaled.
  // Path uses relative coordinates centered on (heartX, heartY).
  const hw = heartW;
  const hh = heartH;
  const heartPath = [
    `M ${heartX + hw / 2} ${heartY + hh}`,
    `C ${heartX + hw / 2} ${heartY + hh}, ${heartX} ${heartY + hh * 0.55}, ${heartX} ${heartY + hh * 0.27}`,
    `C ${heartX} ${heartY + hh * 0.08}, ${heartX + hw * 0.18} ${heartY - hh * 0.05}, ${heartX + hw * 0.35} ${heartY + hh * 0.05}`,
    `C ${heartX + hw * 0.43} ${heartY + hh * 0.1}, ${heartX + hw * 0.48} ${heartY + hh * 0.18}, ${heartX + hw / 2} ${heartY + hh * 0.27}`,
    `C ${heartX + hw * 0.52} ${heartY + hh * 0.18}, ${heartX + hw * 0.57} ${heartY + hh * 0.1}, ${heartX + hw * 0.65} ${heartY + hh * 0.05}`,
    `C ${heartX + hw * 0.82} ${heartY - hh * 0.05}, ${heartX + hw} ${heartY + hh * 0.08}, ${heartX + hw} ${heartY + hh * 0.27}`,
    `C ${heartX + hw} ${heartY + hh * 0.55}, ${heartX + hw / 2} ${heartY + hh}, ${heartX + hw / 2} ${heartY + hh}`,
    `Z`,
  ].join(" ");

  // "PDF" label below the heart.
  const labelFontSize = Math.round(docW * 0.18);
  const labelX = docX + docW / 2;
  const labelY = docY + docH * 0.83;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${BLUE}"/>
      <stop offset="100%" stop-color="${PURPLE}"/>
    </linearGradient>
    <filter id="docShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size * 0.008}" stdDeviation="${size * 0.012}" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Red rounded background -->
  <rect width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#bg)"/>

  <!-- White PDF document with folded corner -->
  <g filter="url(#docShadow)">
    <path d="
      M ${docX} ${docY}
      L ${docX + docW - fold} ${docY}
      L ${docX + docW} ${docY + fold}
      L ${docX + docW} ${docY + docH}
      L ${docX} ${docY + docH}
      Z"
      fill="${WHITE}"/>
    <!-- Folded corner highlight (slightly darker triangle) -->
    <path d="
      M ${docX + docW - fold} ${docY}
      L ${docX + docW - fold} ${docY + fold}
      L ${docX + docW} ${docY + fold}
      Z"
      fill="#e5e7eb"/>
  </g>

  <!-- Blue heart in the document -->
  <path d="${heartPath}" fill="${BLUE}"/>

  <!-- "PDF" text label -->
  <text x="${labelX}" y="${labelY}"
        font-family="Inter, system-ui, -apple-system, Arial, sans-serif"
        font-weight="800"
        font-size="${labelFontSize}"
        fill="${BLUE_DARK}"
        text-anchor="middle"
        letter-spacing="${labelFontSize * 0.05}">PDF</text>
</svg>`.trim();
}

async function renderToPng(svg, size, outPath) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`  ✓ ${path.relative(ROOT, outPath)}`);
}

async function main() {
  console.log("Generating PWA icons...");

  // 192x192, full bleed (purpose=any)
  await renderToPng(
    buildSvg(192, 1.0),
    192,
    path.join(PUBLIC_DIR, "icon-192.png"),
  );

  // 512x512, full bleed (purpose=any)
  await renderToPng(
    buildSvg(512, 1.0),
    512,
    path.join(PUBLIC_DIR, "icon-512.png"),
  );

  // 512x512, maskable (logo at 60% to survive Android shape masks)
  await renderToPng(
    buildSvg(512, 0.6),
    512,
    path.join(PUBLIC_DIR, "icon-maskable-512.png"),
  );

  // Bonus: also save the 512 SVG source so the design can be re-rendered
  // or edited later without re-running this script.
  await writeFile(
    path.join(PUBLIC_DIR, "icon-source.svg"),
    buildSvg(512, 1.0),
    "utf8",
  );
  console.log(`  ✓ public/icon-source.svg (editable source)`);

  console.log("\nDone. 3 PNG icons + 1 SVG source written to public/.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
