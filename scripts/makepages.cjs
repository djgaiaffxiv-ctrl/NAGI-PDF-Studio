const { PDFDocument, StandardFonts, rgb } = require('@cantoo/pdf-lib');
const fs = require('fs');
(async () => {
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.HelveticaBold);
  const cols = [[0.28,0.69,0.70],[0.85,0.30,0.30],[0.30,0.55,0.85]];
  for (let i = 1; i <= 3; i++) {
    const p = doc.addPage([595, 842]);
    p.drawText('PAGINA ' + i, { x: 150, y: 600, size: 52, font: f, color: rgb(...cols[i-1]) });
    p.drawText('arriba ' + i, { x: 250, y: 800, size: 18, font: f, color: rgb(0.2,0.2,0.2) });
    p.drawText('abajo ' + i, { x: 255, y: 40, size: 18, font: f, color: rgb(0.2,0.2,0.2) });
  }
  fs.writeFileSync('C:/Users/Carlos Relaño/Desktop/test-3pag.pdf', await doc.save());
  console.log('test-3pag.pdf creado (3 paginas)');
})();
