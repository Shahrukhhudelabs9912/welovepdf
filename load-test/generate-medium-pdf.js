// Generates a multi-page PDF used by single-user-profile.js for a more
// production-like profile than tiny.pdf (which is 1 page / 540 bytes — too
// small to exercise per-page work in split/merge/page-numbering/organize).
//
// Default: 50 pages of dense text (~80-150 KB). To approximate a 10MB
// realistic input, pass --pages 200 or higher; per-page work scales linearly
// so even 50 pages already swamps the tiny.pdf baseline.
//
// Run:
//   node generate-medium-pdf.js              # 50 pages
//   node generate-medium-pdf.js --pages 200  # bigger
//   node generate-medium-pdf.js --out big.pdf
//
// Output: writes load-test/medium.pdf (or --out path) next to this script.
// single-user-profile.js will auto-use medium.pdf if present, else fall back
// to tiny.pdf.

const fs = require('node:fs');
const path = require('node:path');

function parseArgs() {
  const out = { pages: 50, outName: 'medium.pdf' };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--pages') out.pages = parseInt(argv[++i], 10);
    else if (argv[i] === '--out') out.outName = argv[++i];
    else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('Usage: node generate-medium-pdf.js [--pages N] [--out file.pdf]');
      process.exit(0);
    }
  }
  if (!Number.isFinite(out.pages) || out.pages < 1) {
    throw new Error('--pages must be a positive integer');
  }
  return out;
}

// Build one content stream's text. ~30 lines per page so split/merge/optimize
// see meaningful per-page bytes — not just an empty MediaBox.
function pageContent(pageNum) {
  const lines = [
    `(WeLovePDF Load Test - page ${pageNum}) Tj`,
    `0 -20 Td (The quick brown fox jumps over the lazy dog.) Tj`,
    `0 -20 Td (Lorem ipsum dolor sit amet, consectetur adipiscing elit.) Tj`,
    `0 -20 Td (Sed do eiusmod tempor incididunt ut labore et dolore magna.) Tj`,
    `0 -20 Td (Ut enim ad minim veniam, quis nostrud exercitation ullamco.) Tj`,
    `0 -20 Td (Laboris nisi ut aliquip ex ea commodo consequat duis aute.) Tj`,
    `0 -20 Td (Irure dolor in reprehenderit in voluptate velit esse cillum.) Tj`,
    `0 -20 Td (Dolore eu fugiat nulla pariatur excepteur sint occaecat.) Tj`,
    `0 -20 Td (Cupidatat non proident sunt in culpa qui officia deserunt.) Tj`,
    `0 -20 Td (Mollit anim id est laborum perspiciatis unde omnis iste.) Tj`,
    `0 -20 Td (Natus error sit voluptatem accusantium doloremque laudantium.) Tj`,
    `0 -20 Td (Totam rem aperiam eaque ipsa quae ab illo inventore veritatis.) Tj`,
    `0 -20 Td (Et quasi architecto beatae vitae dicta sunt explicabo nemo.) Tj`,
    `0 -20 Td (Enim ipsam voluptatem quia voluptas sit aspernatur aut odit.) Tj`,
    `0 -20 Td (Aut fugit sed quia consequuntur magni dolores eos qui ratione.) Tj`,
    `0 -20 Td (Voluptatem sequi nesciunt neque porro quisquam est qui dolorem.) Tj`,
    `0 -20 Td (Ipsum quia dolor sit amet consectetur adipisci velit sed quia.) Tj`,
    `0 -20 Td (Non numquam eius modi tempora incidunt ut labore et dolore.) Tj`,
    `0 -20 Td (Magnam aliquam quaerat voluptatem ut enim ad minima veniam.) Tj`,
    `0 -20 Td (Quis nostrum exercitationem ullam corporis suscipit laboriosam.) Tj`,
    `0 -20 Td (Nisi ut aliquid ex ea commodi consequatur quis autem vel eum.) Tj`,
    `0 -20 Td (Iure reprehenderit qui in ea voluptate velit esse quam nihil.) Tj`,
    `0 -20 Td (Molestiae consequatur vel illum qui dolorem eum fugiat quo.) Tj`,
    `0 -20 Td (Voluptas nulla pariatur at vero eos et accusamus et iusto odio.) Tj`,
    `0 -20 Td (Dignissimos ducimus qui blanditiis praesentium voluptatum.) Tj`,
    `0 -20 Td (Deleniti atque corrupti quos dolores et quas molestias excepturi.) Tj`,
    `0 -20 Td (Sint occaecati cupiditate non provident similique sunt in culpa.) Tj`,
    `0 -20 Td (Qui officia deserunt mollitia animi id est laborum et dolorum.) Tj`,
    `0 -20 Td (Fuga et harum quidem rerum facilis est et expedita distinctio.) Tj`,
  ];
  return `BT /F1 11 Tf 50 780 Td\n${lines.join('\n')}\nET`;
}

function buildPdf(pageCount) {
  // Object numbering:
  //   1 = Catalog
  //   2 = Pages (root)
  //   3 = Font
  //   4..(4+pageCount-1)            = Page objects
  //   (4+pageCount)..(4+2*pageCount-1) = Content streams
  const FONT_OBJ = 3;
  const FIRST_PAGE = 4;
  const FIRST_CONTENT = 4 + pageCount;
  const totalObjs = 3 + 2 * pageCount;

  // Build object bodies as strings; we'll concatenate with byte-accurate
  // offsets so the xref table is correct.
  const objects = new Array(totalObjs + 1); // 1-indexed
  const kids = [];
  for (let i = 0; i < pageCount; i++) kids.push(`${FIRST_PAGE + i} 0 R`);

  objects[1] = `<</Type/Catalog/Pages 2 0 R>>`;
  objects[2] = `<</Type/Pages/Kids[${kids.join(' ')}]/Count ${pageCount}>>`;
  objects[FONT_OBJ] = `<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>`;

  for (let i = 0; i < pageCount; i++) {
    const pageObj = FIRST_PAGE + i;
    const contentObj = FIRST_CONTENT + i;
    objects[pageObj] =
      `<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]` +
      `/Contents ${contentObj} 0 R` +
      `/Resources<</Font<</F1 ${FONT_OBJ} 0 R>>>>>>`;
    const stream = pageContent(i + 1);
    objects[contentObj] =
      `<</Length ${Buffer.byteLength(stream)}>>\nstream\n${stream}\nendstream`;
  }

  // Assemble with byte offsets. We measure with 'binary' (Latin-1, 1-byte
  // per char) and final-encode the same way so the xref offsets are exact.
  // Using utf-8 here would mis-count the binary marker bytes by 4.
  const header = '%PDF-1.4\n%\xff\xff\xff\xff\n'; // binary marker keeps tooling happy
  let body = header;
  const offsets = new Array(totalObjs + 1).fill(0);
  for (let n = 1; n <= totalObjs; n++) {
    offsets[n] = Buffer.byteLength(body, 'binary');
    body += `${n} 0 obj\n${objects[n]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(body, 'binary');
  let xref = `xref\n0 ${totalObjs + 1}\n`;
  xref += '0000000000 65535 f \n';
  for (let n = 1; n <= totalObjs; n++) {
    xref += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`;
  }
  const trailer =
    `trailer\n<</Size ${totalObjs + 1}/Root 1 0 R>>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(body + xref + trailer, 'binary');
}

const { pages, outName } = parseArgs();
const buf = buildPdf(pages);
const outPath = path.join(__dirname, outName);
fs.writeFileSync(outPath, buf);
console.log(
  `Wrote ${outName} (${pages} pages, ${(buf.length / 1024).toFixed(1)} KB)`,
);
