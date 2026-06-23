const { PDFDocument, rgb, StandardFonts } = require('@cantoo/pdf-lib');
const fs = require('fs');
(async () => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]);
  page.drawText('LISTA DE PARTIDAS (lineas juntas, tipo tabla)', { x: 50, y: 790, size: 13, font, color: rgb(0.1,0.1,0.1) });
  let y = 740;
  for (let i = 1; i <= 18; i++) {
    page.drawText(`${i}.  Taladros de ${60+i}-${70+i} mm . . . . . . . . .  ${100+i*7},00 EUR`, { x: 50, y, size: 11, font, color: rgb(0.15,0.15,0.15) });
    y -= 20; // lineas muy juntas
  }
  fs.writeFileSync('C:\\Users\\Carlos Relaño\\Desktop\\test-lineas.pdf', await doc.save());
  console.log('PDF de lineas creado: test-lineas.pdf');
})();
