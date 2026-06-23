const { PDFDocument, rgb, StandardFonts } = require('@cantoo/pdf-lib');
const fs = require('fs');
(async () => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let i = 1; i <= 2; i++) {
    const p = doc.addPage([420, 595]);
    p.drawRectangle({ x: 0, y: 0, width: 420, height: 595, color: rgb(0.42, 0.36, 0.90), opacity: 0.12 });
    p.drawText('DOC B - ' + i, { x: 110, y: 300, size: 40, font, color: rgb(0.42, 0.36, 0.90) });
  }
  fs.writeFileSync('C:\\Users\\Carlos Relaño\\Desktop\\test-nagi-2.pdf', await doc.save());
  console.log('Segundo PDF creado: test-nagi-2.pdf');
})();
