#!/usr/bin/env node
// Injects BreadcrumbJsonLd, SoftwareApplicationJsonLd, HowToJsonLd, FAQPageJsonLd
// into every tool page that doesn't already have them.
//
// Usage: node frontend/scripts/inject-jsonld.mjs
//
// Categories:
//   A) Pages that already use <ToolLayout> with seoContent.faq —
//      we hoist the existing FAQ to a const, add HOW_TO_STEPS, and
//      wrap the return in a fragment with JSON-LD components.
//   B) Wrapper pages whose page.tsx just renders <XClient />.
//      We rebuild the page.tsx with proper metadata + JSON-LD,
//      keeping the dynamic client import unchanged.
//   C) ai-tools — different structure (next-intl based). Skipped here;
//      gets a minimal Breadcrumb + SoftwareApplication via a separate
//      branch below.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "app");

const SLUG_TO_PAGE_FUNC = {};

// HOW_TO_STEPS for each tool — keep generic enough to be true for any user.
const TOOLS = [
  // ───────────────────────── Category A ─────────────────────────
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    breadcrumb: "Compress PDF",
    softwareName: "PDF Compressor",
    softwareDescription:
      "Free online tool to reduce PDF file size while maintaining visual quality.",
    howToName: "How to Compress a PDF",
    howToDesc: "Reduce a PDF's file size in 4 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Click upload or drop your PDF into the tool area." },
      { name: "Choose compression level", text: "Pick Low, Medium, or High depending on quality vs. size trade-off." },
      { name: "Compress the file", text: "Press Compress and let our engine optimize images and remove unused data." },
      { name: "Download", text: "Save the smaller PDF to your device." },
    ],
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    breadcrumb: "Split PDF",
    softwareName: "PDF Splitter",
    softwareDescription:
      "Free online tool to split a PDF into multiple files by page ranges or specific pages.",
    howToName: "How to Split a PDF",
    howToDesc: "Divide one PDF into several output files in 4 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Click upload or drag the PDF you want to split into the tool." },
      { name: "Choose split mode", text: "Pick page ranges (e.g. 1-10, 11-20), specific pages, or split-every-N." },
      { name: "Split the file", text: "Click Split and we'll produce one output PDF per range." },
      { name: "Download", text: "Save the resulting PDFs as a zip or individually." },
    ],
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    breadcrumb: "PDF to JPG",
    softwareName: "PDF to JPG Converter",
    softwareDescription:
      "Free online tool to convert PDF pages into high-quality JPG images.",
    howToName: "How to Convert PDF to JPG",
    howToDesc: "Turn PDF pages into JPG images in 4 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Click upload or drop the PDF you want to convert." },
      { name: "Pick pages and quality", text: "Select all pages or a specific range and choose image quality / DPI." },
      { name: "Convert to JPG", text: "Click Convert — each page becomes a separate JPG image." },
      { name: "Download", text: "Save the images as a zip or individually." },
    ],
  },
  {
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    breadcrumb: "JPG to PDF",
    softwareName: "JPG to PDF Converter",
    softwareDescription:
      "Free online tool to convert JPG and other images into a single PDF document.",
    howToName: "How to Convert JPG to PDF",
    howToDesc: "Combine images into one PDF in 4 steps.",
    howToSteps: [
      { name: "Upload images", text: "Drop or select JPG, PNG, GIF, WebP, BMP or TIFF files." },
      { name: "Arrange the order", text: "Drag images into the order they should appear in the PDF." },
      { name: "Choose page settings", text: "Pick page size (A4, Letter, Legal), orientation, and margins." },
      { name: "Download the PDF", text: "Click Convert and download the combined PDF." },
    ],
  },
  {
    slug: "add-watermark",
    name: "Add Watermark",
    breadcrumb: "Add Watermark",
    softwareName: "PDF Watermark Tool",
    softwareDescription:
      "Free online tool to add text or image watermarks to a PDF document.",
    howToName: "How to Add a Watermark to a PDF",
    howToDesc: "Stamp a text or image watermark onto a PDF in 4 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Drop the PDF you want to watermark into the tool." },
      { name: "Choose watermark type", text: "Pick a text watermark (with font, size, color) or upload a PNG/JPG/SVG image." },
      { name: "Position and style", text: "Set position, opacity, rotation, and which pages to apply it to." },
      { name: "Download", text: "Click Apply Watermark and save the watermarked PDF." },
    ],
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    breadcrumb: "Rotate PDF",
    softwareName: "PDF Rotator",
    softwareDescription:
      "Free online tool to rotate PDF pages by 90, 180, or 270 degrees.",
    howToName: "How to Rotate a PDF",
    howToDesc: "Fix sideways or upside-down PDF pages in 3 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Drop the PDF you want to rotate into the tool." },
      { name: "Pick rotation angle and pages", text: "Choose 90°, 180°, or 270° and either all pages or a custom range like 1,3,5-7." },
      { name: "Download", text: "Click Rotate and save the corrected PDF." },
    ],
  },
  {
    slug: "extract-pages",
    name: "Extract Pages",
    breadcrumb: "Extract Pages",
    softwareName: "PDF Page Extractor",
    softwareDescription:
      "Free online tool to pull selected pages from a PDF into a new document.",
    howToName: "How to Extract Pages from a PDF",
    howToDesc: "Build a new PDF from selected pages in 3 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Drop your source PDF into the tool." },
      { name: "Type the pages", text: "Enter page numbers and ranges separated by commas (e.g. 1,3,5-7)." },
      { name: "Download", text: "Click Extract and save the new PDF containing only those pages." },
    ],
  },
  {
    slug: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    breadcrumb: "PowerPoint to PDF",
    softwareName: "PowerPoint to PDF Converter",
    softwareDescription:
      "Free online tool to convert .ppt and .pptx presentations into PDF documents.",
    howToName: "How to Convert PowerPoint to PDF",
    howToDesc: "Turn a slide deck into a shareable PDF in 3 steps.",
    howToSteps: [
      { name: "Upload your slide deck", text: "Drop a .ppt or .pptx file into the tool." },
      { name: "Convert", text: "Click Convert — our headless engine flattens the deck into a PDF." },
      { name: "Download", text: "Save the resulting PDF, layout and fonts intact." },
    ],
  },
  {
    slug: "pdf-to-powerpoint",
    name: "PDF to PowerPoint",
    breadcrumb: "PDF to PowerPoint",
    softwareName: "PDF to PowerPoint Converter",
    softwareDescription:
      "Free online tool to convert a PDF into a PowerPoint presentation, one slide per page.",
    howToName: "How to Convert PDF to PowerPoint",
    howToDesc: "Turn a PDF into a PPTX deck in 3 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Drop your PDF into the tool." },
      { name: "Convert", text: "Click Convert — every page becomes a high-resolution slide." },
      { name: "Download", text: "Save the resulting .pptx file (16:9 widescreen)." },
    ],
  },
  {
    slug: "sign-pdf",
    name: "Sign PDF",
    breadcrumb: "Sign PDF",
    softwareName: "PDF Signer",
    softwareDescription:
      "Free online tool to add a typed or uploaded signature to a PDF document.",
    howToName: "How to Sign a PDF",
    howToDesc: "Add a visual signature to a PDF in 4 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Drop the PDF you want to sign into the tool." },
      { name: "Create your signature", text: "Type your name in a script font or upload a transparent PNG of your signature." },
      { name: "Place it on the page", text: "Click where the signature should appear and resize as needed." },
      { name: "Download", text: "Click Apply and save the signed PDF." },
    ],
  },
  {
    slug: "unlock-pdf",
    name: "Unlock PDF",
    breadcrumb: "Unlock PDF",
    softwareName: "PDF Password Remover",
    softwareDescription:
      "Free online tool to remove password protection from a PDF using the original password.",
    howToName: "How to Unlock a PDF",
    howToDesc: "Strip the password from a PDF in 3 steps.",
    howToSteps: [
      { name: "Upload the protected PDF", text: "Drop the password-protected PDF into the tool." },
      { name: "Enter the password", text: "Type the original open password — we cannot recover unknown passwords." },
      { name: "Download the unlocked PDF", text: "Click Unlock and save the decrypted PDF." },
    ],
  },
  {
    slug: "ocr-pdf",
    name: "OCR PDF",
    breadcrumb: "OCR PDF",
    softwareName: "OCR PDF Tool",
    softwareDescription:
      "Free online tool to make scanned PDFs searchable by adding an invisible text layer.",
    howToName: "How to OCR a Scanned PDF",
    howToDesc: "Make a scanned PDF searchable in 3 steps.",
    howToSteps: [
      { name: "Upload the scanned PDF", text: "Drop your scanned or image-only PDF into the tool." },
      { name: "Run OCR", text: "Click OCR — every page is processed and an invisible text layer is added." },
      { name: "Download", text: "Save the searchable PDF — the visible content is unchanged." },
    ],
  },

  // ───────────────────────── Category B ─────────────────────────
  // Wrapper pages — page.tsx will be rebuilt with metadata + JSON-LD.
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    breadcrumb: "PDF to Word",
    isWrapper: true,
    clientImport: './pdf-to-word-client',
    clientExport: 'PDFToWordClient',
    pageFunc: 'PDFToWordPage',
    metaTitle: "Convert PDF to Word Online Free | PDFOrca",
    metaDescription:
      "Convert PDF documents to editable Word (.docx) files online for free. Preserve layout, text, and images. No registration required.",
    metaKeywords:
      "pdf to word, convert pdf to word, pdf to docx, pdf to word converter, pdf to word online, free pdf to word",
    softwareName: "PDF to Word Converter",
    softwareDescription:
      "Free online tool to convert PDF documents into editable Word .docx files.",
    howToName: "How to Convert PDF to Word",
    howToDesc: "Turn a PDF into an editable Word document in 3 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Drop the PDF you want to convert into the tool." },
      { name: "Convert", text: "Click Convert — text, layout, and images are extracted into a .docx file." },
      { name: "Download", text: "Save the Word document and edit it in Microsoft Word, Google Docs, or LibreOffice." },
    ],
    faq: [
      { question: "Is the converted Word file editable?", answer: "Yes. Text, paragraphs, and most layout elements are reconstructed as native Word content you can edit." },
      { question: "Will my PDF formatting be preserved?", answer: "Layout, fonts, and images are preserved as closely as possible. Highly designed PDFs may need minor cleanup." },
      { question: "Is my PDF safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
      { question: "What's the maximum file size?", answer: "100 MB per PDF for free users." },
    ],
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    breadcrumb: "Word to PDF",
    isWrapper: true,
    clientImport: './word-to-pdf-client',
    clientExport: 'WordToPDFClient',
    pageFunc: 'WordToPDFPage',
    metaTitle: "Convert Word to PDF Online Free | PDFOrca",
    metaDescription:
      "Convert Word documents (.doc, .docx) to PDF online for free. Preserve formatting, fonts, and images. No registration required.",
    metaKeywords:
      "word to pdf, convert word to pdf, doc to pdf, docx to pdf, word to pdf converter, free word to pdf",
    softwareName: "Word to PDF Converter",
    softwareDescription:
      "Free online tool to convert Word .doc and .docx files into PDF documents.",
    howToName: "How to Convert Word to PDF",
    howToDesc: "Turn a Word document into a PDF in 3 steps.",
    howToSteps: [
      { name: "Upload your Word file", text: "Drop a .doc or .docx file into the tool." },
      { name: "Convert", text: "Click Convert — our headless LibreOffice engine renders it to PDF." },
      { name: "Download", text: "Save the PDF — fonts and layout intact." },
    ],
    faq: [
      { question: "Will my fonts and formatting be preserved?", answer: "Yes. We use a headless office engine that preserves fonts, layout, and images faithfully." },
      { question: "Does the tool support .doc as well as .docx?", answer: "Yes. Both legacy .doc and modern .docx are supported." },
      { question: "Is my document safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
      { question: "What's the maximum file size?", answer: "100 MB per file for free users." },
    ],
  },
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    breadcrumb: "Excel to PDF",
    isWrapper: true,
    clientImport: './excel-to-pdf-client',
    clientExport: 'ExcelToPDFClient',
    pageFunc: 'ExcelToPDFPage',
    metaTitle: "Convert Excel to PDF Online Free | PDFOrca",
    metaDescription:
      "Convert Excel spreadsheets (.xls, .xlsx) to PDF online for free. Preserve formatting, formulas, and charts. No registration required.",
    metaKeywords:
      "excel to pdf, convert excel to pdf, xls to pdf, xlsx to pdf, excel to pdf converter, free excel to pdf",
    softwareName: "Excel to PDF Converter",
    softwareDescription:
      "Free online tool to convert Excel .xls and .xlsx spreadsheets into PDF documents.",
    howToName: "How to Convert Excel to PDF",
    howToDesc: "Turn a spreadsheet into a PDF in 3 steps.",
    howToSteps: [
      { name: "Upload your spreadsheet", text: "Drop a .xls or .xlsx file into the tool." },
      { name: "Convert", text: "Click Convert — sheets, charts, and formatting are flattened to PDF." },
      { name: "Download", text: "Save the PDF, ready to share or print." },
    ],
    faq: [
      { question: "Will my charts and formatting be preserved?", answer: "Yes. Charts, conditional formatting, and cell styles are rendered into the PDF." },
      { question: "Does each sheet become a separate page?", answer: "Sheets are paginated according to their print area, so a multi-sheet workbook produces multiple pages." },
      { question: "Is my spreadsheet safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
      { question: "What's the maximum file size?", answer: "100 MB per file for free users." },
    ],
  },
  {
    slug: "pdf-to-excel",
    name: "PDF to Excel",
    breadcrumb: "PDF to Excel",
    isWrapper: true,
    clientImport: './pdf-to-excel-client',
    clientExport: 'PDFToExcelClient',
    pageFunc: 'PDFToExcelPage',
    metaTitle: "Convert PDF to Excel Online Free | PDFOrca",
    metaDescription:
      "Convert PDF documents to editable Excel (.xlsx) spreadsheets online for free. Extract tables and data from PDFs.",
    metaKeywords:
      "pdf to excel, convert pdf to excel, pdf to xlsx, pdf to spreadsheet, extract tables from pdf, pdf to excel converter",
    softwareName: "PDF to Excel Converter",
    softwareDescription:
      "Free online tool to extract tables and data from PDFs into editable Excel .xlsx spreadsheets.",
    howToName: "How to Convert PDF to Excel",
    howToDesc: "Extract tabular data from a PDF into Excel in 3 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Drop the PDF you want to convert into the tool." },
      { name: "Convert", text: "Click Convert — tables are detected and reconstructed as Excel sheets." },
      { name: "Download", text: "Save the .xlsx file and edit it in Excel, Google Sheets, or LibreOffice." },
    ],
    faq: [
      { question: "What kinds of PDFs work best?", answer: "PDFs with clearly delimited tables. Scanned PDFs need OCR first — try our OCR PDF tool." },
      { question: "Will the formulas be preserved?", answer: "PDFs only store rendered values, not formulas. The Excel output contains the values shown in the PDF." },
      { question: "Is my PDF safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
      { question: "What's the maximum file size?", answer: "100 MB per PDF for free users." },
    ],
  },
  {
    slug: "organize-pdf",
    name: "Organize PDF",
    breadcrumb: "Organize PDF",
    isWrapper: true,
    clientImport: './organize-pdf-client',
    clientExport: 'OrganizePDFClient',
    pageFunc: 'OrganizePDFPage',
    metaTitle: "Organize PDF Pages Online Free - Reorder, Rotate, Delete | PDFOrca",
    metaDescription:
      "Reorder, rotate, and delete pages in a PDF online for free. Drag-and-drop interface, no registration required.",
    metaKeywords:
      "organize pdf, reorder pdf pages, rearrange pdf, delete pdf pages, rotate pdf pages, pdf organizer",
    softwareName: "PDF Organizer",
    softwareDescription:
      "Free online tool to reorder, rotate, and delete pages within a PDF using a drag-and-drop interface.",
    howToName: "How to Organize a PDF",
    howToDesc: "Reorder, rotate, and delete pages in a PDF in 4 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Drop your PDF into the tool to see thumbnails of every page." },
      { name: "Reorder pages", text: "Drag thumbnails to rearrange the page order." },
      { name: "Rotate or delete", text: "Use the per-page controls to rotate or remove pages you don't need." },
      { name: "Download", text: "Click Apply and save the reorganized PDF." },
    ],
    faq: [
      { question: "Can I reorder, rotate, and delete in one pass?", answer: "Yes. Apply any combination of changes and they're written into the output PDF in a single step." },
      { question: "Will the PDF lose quality?", answer: "No. Pages are copied as-is — text, images, and links remain unchanged." },
      { question: "Is my PDF safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
      { question: "What's the maximum file size?", answer: "100 MB per PDF for free users." },
    ],
  },
  {
    slug: "protect-pdf",
    name: "Protect PDF",
    breadcrumb: "Protect PDF",
    isWrapper: true,
    clientImport: './protect-pdf-client',
    clientExport: 'ProtectPDFClient',
    pageFunc: 'ProtectPDFPage',
    metaTitle: "Password Protect PDF Online Free - Encrypt PDF Files | PDFOrca",
    metaDescription:
      "Add password protection to PDF files online for free. AES encryption, no registration required.",
    metaKeywords:
      "protect pdf, password protect pdf, encrypt pdf, secure pdf, pdf password, lock pdf, add password to pdf",
    softwareName: "PDF Password Protection Tool",
    softwareDescription:
      "Free online tool to add password protection and AES encryption to a PDF document.",
    howToName: "How to Password-Protect a PDF",
    howToDesc: "Encrypt a PDF with a password in 3 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Drop the PDF you want to protect into the tool." },
      { name: "Set a password", text: "Choose a strong password — this is the password readers will need to open the file." },
      { name: "Download", text: "Click Protect and save the encrypted PDF." },
    ],
    faq: [
      { question: "What encryption is used?", answer: "AES-128 or AES-256 depending on the option you select. Both are industry-standard PDF encryption schemes." },
      { question: "Can I recover a forgotten password?", answer: "No — that's the whole point of encryption. Keep your password somewhere safe." },
      { question: "Is my PDF safe during processing?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
      { question: "What's the maximum file size?", answer: "100 MB per PDF for free users." },
    ],
  },
  {
    slug: "page-numbering",
    name: "Page Numbering",
    breadcrumb: "Page Numbering",
    isWrapper: true,
    clientImport: './page-numbering-client',
    clientExport: 'PageNumberingClient',
    pageFunc: 'PageNumberingPage',
    metaTitle: "Add Page Numbers to PDF Online Free | PDFOrca",
    metaDescription:
      "Add page numbers to a PDF document online for free. Customize position, format, and starting number. No registration required.",
    metaKeywords:
      "add page numbers to pdf, pdf page numbering, number pdf pages, pdf page numbers, paginate pdf",
    softwareName: "PDF Page Numbering Tool",
    softwareDescription:
      "Free online tool to add page numbers to a PDF with control over position, format, and starting number.",
    howToName: "How to Add Page Numbers to a PDF",
    howToDesc: "Number every page of a PDF in 4 steps.",
    howToSteps: [
      { name: "Upload your PDF", text: "Drop the PDF you want to number into the tool." },
      { name: "Choose position", text: "Pick top or bottom, left/center/right, and the format (e.g. '1', 'Page 1', '1 of N')." },
      { name: "Set the starting number", text: "Choose where numbering starts — useful when chapter PDFs continue from a previous file." },
      { name: "Download", text: "Click Apply and save the numbered PDF." },
    ],
    faq: [
      { question: "Can I skip the title page?", answer: "Yes. Set the starting page so numbering begins from page 2 (or any other page)." },
      { question: "What number formats are supported?", answer: "Plain numbers ('1'), 'Page 1', '1 of 10', and Roman numerals." },
      { question: "Is my PDF safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
      { question: "What's the maximum file size?", answer: "100 MB per PDF for free users." },
    ],
  },
];

const SITE_URL_CONST = `const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pdforca.com";`;

const JSONLD_IMPORT = `import {
  SoftwareApplicationJsonLd,
  HowToJsonLd,
  FAQPageJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/json-ld";`;

function stepsToCode(steps) {
  return steps
    .map(
      (s) =>
        `  { name: ${JSON.stringify(s.name)}, text: ${JSON.stringify(s.text)} },`,
    )
    .join("\n");
}

function faqToCode(items) {
  return items
    .map(
      (it) =>
        `  { question: ${JSON.stringify(it.question)}, answer: ${JSON.stringify(it.answer)} },`,
    )
    .join("\n");
}

function jsonLdBlock(tool, kind /* 'A' | 'B' */) {
  // For wrapper pages we always have local FAQ_ITEMS / HOW_TO_STEPS consts.
  // For ToolLayout pages too — we hoist the inline faq into FAQ_ITEMS.
  return `      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: ${JSON.stringify(tool.breadcrumb)}, url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name=${JSON.stringify(tool.softwareName)}
        description=${JSON.stringify(tool.softwareDescription)}
        url={pageUrl}
      />
      <HowToJsonLd
        name=${JSON.stringify(tool.howToName)}
        description=${JSON.stringify(tool.howToDesc)}
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />`;
}

async function patchToolLayoutPage(tool) {
  const file = path.join(APP, tool.slug, "page.tsx");
  let src = await readFile(file, "utf8");
  if (src.includes("SoftwareApplicationJsonLd")) {
    return { slug: tool.slug, status: "already-has-jsonld" };
  }
  if (!src.includes("<ToolLayout")) {
    return { slug: tool.slug, status: "no-toollayout" };
  }

  // 1. Extract the existing inline `faq: [ ... ]` array from seoContent.
  //    We expect the merge-pdf style: properties on multiple lines.
  const faqMatch = src.match(/faq:\s*(\[[\s\S]*?\n\s*\])\s*,?\s*\n\s*\}/);
  if (!faqMatch) {
    return { slug: tool.slug, status: "no-faq-found" };
  }
  const faqArrayLiteral = faqMatch[1];

  // 2. Replace the inline array with `FAQ_ITEMS` reference.
  src = src.replace(faqMatch[0], `faq: FAQ_ITEMS,\n      }`);

  // 3. Inject imports + SITE_URL + HOW_TO_STEPS + FAQ_ITEMS above the
  //    `export const metadata` (or above the dynamic import if metadata is missing).
  const stepsCode = stepsToCode(tool.howToSteps);
  const constsBlock = `${SITE_URL_CONST}

const HOW_TO_STEPS = [
${stepsCode}
];

const FAQ_ITEMS = ${faqArrayLiteral};

`;

  // Add JSON-LD import after the last `import ... from "@/components/skeleton-loader";`
  // line. Some pages use ToolContentSkeleton, others use ToolPageSkeleton.
  const importAnchor = /(import\s*\{\s*Tool(?:Content|Page)Skeleton\s*\}\s*from\s*"@\/components\/skeleton-loader";\s*\n)/;
  if (!importAnchor.test(src)) {
    return { slug: tool.slug, status: "import-anchor-missing" };
  }
  src = src.replace(importAnchor, `$1${JSONLD_IMPORT}\n\n${constsBlock}`);

  // 4. Wrap the return statement: replace
  //    `return (\n    <ToolLayout` with
  //    `const pageUrl = ...;\n  return (\n    <>\n      <Breadcrumb... />\n      ...\n      <ToolLayout`
  //    and close `</>` before the trailing `);`.
  const returnAnchor = /export default function (\w+)\(\)\s*\{\s*\n\s*return \(\s*\n(\s*)<ToolLayout/;
  const m = src.match(returnAnchor);
  if (!m) {
    return { slug: tool.slug, status: "return-anchor-missing" };
  }
  const fnName = m[1];
  SLUG_TO_PAGE_FUNC[tool.slug] = fnName;
  const indent = m[2]; // usually "    "
  src = src.replace(
    returnAnchor,
    `export default function ${fnName}() {\n  const pageUrl = \`\${SITE_URL}/${tool.slug}\`;\n  return (\n${indent}<>\n${jsonLdBlock(tool, "A")}\n${indent}<ToolLayout`,
  );

  // Now close the fragment: find the matching `</ToolLayout>\n  );` (or
  // `</ToolLayout>\n);`) and replace with `</ToolLayout>\n      </>\n  );`.
  const closeAnchor = /<\/ToolLayout>\s*\n(\s*)\);/;
  if (!closeAnchor.test(src)) {
    return { slug: tool.slug, status: "close-anchor-missing" };
  }
  src = src.replace(closeAnchor, `</ToolLayout>\n${indent}</>\n$1);`);

  await writeFile(file, src);
  return { slug: tool.slug, status: "patched-A" };
}

async function patchWrapperPage(tool) {
  const file = path.join(APP, tool.slug, "page.tsx");
  let existing = "";
  try {
    existing = await readFile(file, "utf8");
  } catch {
    return { slug: tool.slug, status: "missing-file" };
  }
  if (existing.includes("SoftwareApplicationJsonLd")) {
    return { slug: tool.slug, status: "already-has-jsonld" };
  }
  // Detect the actual skeleton loader import used (some wrappers use
  // ToolPageSkeleton, others use ToolContentSkeleton).
  const usesPageSkeleton = /ToolPageSkeleton/.test(existing);
  const skeletonImport = usesPageSkeleton
    ? `import { ToolPageSkeleton } from "@/components/skeleton-loader";`
    : `import { ToolContentSkeleton } from "@/components/skeleton-loader";`;
  const skeletonComp = usesPageSkeleton ? "ToolPageSkeleton" : "ToolContentSkeleton";

  const stepsCode = stepsToCode(tool.howToSteps);
  const faqCode = faqToCode(tool.faq);

  const newSrc = `import type { Metadata } from "next";
import dynamic from "next/dynamic";
${skeletonImport}
${JSONLD_IMPORT}

${SITE_URL_CONST}

const ${tool.clientExport} = dynamic(
  () => import("${tool.clientImport}").then((mod) => ({ default: mod.${tool.clientExport} })),
  { loading: () => <${skeletonComp} />, ssr: false },
);

export const metadata: Metadata = {
  title: ${JSON.stringify(tool.metaTitle)},
  description: ${JSON.stringify(tool.metaDescription)},
  keywords: ${JSON.stringify(tool.metaKeywords)},
  openGraph: {
    title: ${JSON.stringify(tool.metaTitle)},
    description: ${JSON.stringify(tool.metaDescription)},
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ${JSON.stringify(tool.metaTitle)},
    description: ${JSON.stringify(tool.metaDescription)},
  },
  alternates: {
    canonical: \`\${process.env.NEXT_PUBLIC_SITE_URL || "https://pdforca.com"}/${tool.slug}\`,
    languages: {
      en: \`\${process.env.NEXT_PUBLIC_SITE_URL || "https://pdforca.com"}/${tool.slug}\`,
      hi: \`\${process.env.NEXT_PUBLIC_SITE_URL || "https://pdforca.com"}/hi/${tool.slug}\`,
    },
  },
};

const HOW_TO_STEPS = [
${stepsCode}
];

const FAQ_ITEMS = [
${faqCode}
];

export default function ${tool.pageFunc}() {
  const pageUrl = \`\${SITE_URL}/${tool.slug}\`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: ${JSON.stringify(tool.breadcrumb)}, url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name=${JSON.stringify(tool.softwareName)}
        description=${JSON.stringify(tool.softwareDescription)}
        url={pageUrl}
      />
      <HowToJsonLd
        name=${JSON.stringify(tool.howToName)}
        description=${JSON.stringify(tool.howToDesc)}
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      <${tool.clientExport} />
    </>
  );
}
`;
  await writeFile(file, newSrc);
  return { slug: tool.slug, status: "patched-B" };
}

const results = [];
for (const tool of TOOLS) {
  if (tool.isWrapper) {
    results.push(await patchWrapperPage(tool));
  } else {
    results.push(await patchToolLayoutPage(tool));
  }
}

console.log("\nResults:");
for (const r of results) {
  console.log(`  ${r.slug.padEnd(22)} ${r.status}`);
}
console.log("\nDone.");
