const { PDFDocument, rgb, StandardFonts } = require('@cantoo/pdf-lib');
const fs = require('fs');
(async () => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const colors = [rgb(0.28, 0.69, 0.70), rgb(0.97, 0.67, 0.24), rgb(0.42, 0.36, 0.90)];
  for (let i = 1; i <= 3; i++) {
    const p = doc.addPage([420, 595]);
    p.drawRectangle({ x: 0, y: 0, width: 420, height: 595, color: colors[i - 1], opacity: 0.15 });
    p.drawText('Pagina ' + i, { x: 120, y: 300, size: 48, font, color: colors[i - 1] });
    p.drawText('Nagi PDF Studio - test', { x: 90, y: 250, size: 16, font, color: rgb(0.3, 0.3, 0.3) });
  }
  fs.writeFileSync('C:\\Users\\Carlos Relaño\\Desktop\\test-nagi.pdf', await doc.save());
  console.log('PDF de prueba creado en el Escritorio: test-nagi.pdf');
})();
