const fs = require('fs');
const { PDFDocument } = require('@cantoo/pdf-lib');

const file = process.argv[2];
(async () => {
  const buf = fs.readFileSync(file);
  console.log('Tamaño leído:', buf.length, 'bytes');

  // 1) pdf-lib
  try {
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    console.log('pdf-lib getPageCount:', doc.getPageCount());
  } catch (e) { console.log('pdf-lib ERROR:', e.message); }

  // 2) pdfjs (legacy, en node)
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const data = new Uint8Array(buf);
    const task = pdfjs.getDocument({ data, useSystemFonts: true });
    const pdf = await task.promise;
    console.log('pdf.js numPages:', pdf.numPages);
    // rotaciones por página
    const rots = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
      const p = await pdf.getPage(i);
      rots.push(p.rotate);
    }
    console.log('pdf.js rotaciones por página:', rots.join(','));
  } catch (e) { console.log('pdf.js ERROR:', e.message); }
})();
