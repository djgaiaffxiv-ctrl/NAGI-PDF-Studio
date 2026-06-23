const { PDFDocument, StandardFonts, rgb } = require('@cantoo/pdf-lib');
const fs = require('fs');
(async () => {
  const doc = await PDFDocument.create();
  const p = doc.addPage([595, 842]);
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const fb = await doc.embedFont(StandardFonts.HelveticaBold);
  p.drawText('ACTA DE RECEPCION DE OBRA', { x: 80, y: 760, size: 24, font: fb, color: rgb(0,0,0) });
  const lines = [
    'En la ciudad de Madrid, a 23 de junio de 2026, se reune la',
    'comision para la recepcion de las obras del edificio situado',
    'en la calle Mayor numero 15. El importe total asciende a',
    'cuarenta y dos mil euros (42.000 EUR), IVA incluido.',
    'Se aprueba por unanimidad la conformidad de los trabajos.',
  ];
  let y = 700;
  for (const ln of lines) { p.drawText(ln, { x: 80, y, size: 16, font: f, color: rgb(0.1,0.1,0.1) }); y -= 30; }
  fs.writeFileSync('C:/Users/Carlos Relaño/Desktop/test-acta.pdf', await doc.save());
  console.log('test-acta.pdf creado');
})();
