const { PDFDocument, StandardFonts, rgb } = require('@cantoo/pdf-lib');
const fs = require('fs');
(async () => {
  const doc = await PDFDocument.create();
  const p = doc.addPage([595, 842]);
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const tb = await doc.embedFont(StandardFonts.TimesRomanBold);
  const tr = await doc.embedFont(StandardFonts.TimesRoman);
  const hbo = await doc.embedFont(StandardFonts.HelveticaBoldOblique);
  const cou = await doc.embedFont(StandardFonts.Courier);
  const lines = [
    ['Titulo en Times Negrita', tb, 22, 760],
    ['Parrafo normal en Times Roman serif', tr, 15, 715],
    ['Texto Helvetica normal sans', reg, 15, 680],
    ['Aviso Helvetica Negrita Cursiva', hbo, 15, 645],
    ['Codigo en Courier monospace 123', cou, 14, 610],
  ];
  for (const [t, f, s, y] of lines) p.drawText(t, { x: 60, y, size: s, font: f, color: rgb(0.12, 0.12, 0.12) });
  fs.writeFileSync('C:/Users/Carlos Relaño/Desktop/test-fuentes.pdf', await doc.save());
  console.log('test-fuentes.pdf creado');
})();
