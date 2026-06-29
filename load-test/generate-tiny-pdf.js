// Generates a minimal 1-page PDF (~470 bytes) used by k6-load-test.js.
// Run once: `node generate-tiny-pdf.js`  -> writes tiny.pdf next to this file.
// We keep the upload tiny so the load generator doesn't OOM at high VU counts.

const fs = require('fs');
const path = require('path');

const pdf = Buffer.from(
  `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 44>>stream
BT /F1 18 Tf 20 60 Td (PDFOrca Load Test) Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000100 00000 n
0000000192 00000 n
0000000280 00000 n
trailer<</Size 6/Root 1 0 R>>
startxref
340
%%EOF`,
  'utf8',
);

fs.writeFileSync(path.join(__dirname, 'tiny.pdf'), pdf);
console.log(`Wrote tiny.pdf (${pdf.length} bytes)`);
