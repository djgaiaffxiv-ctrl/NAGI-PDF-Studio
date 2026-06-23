const fs = require('fs');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { PDFDocument } = require('@cantoo/pdf-lib');
(async () => {
  const fams = GlobalFonts.families ? GlobalFonts.families.map((f) => f.family) : [];
  const fam = ['Arial', 'Segoe UI', 'Calibri', 'Tahoma', 'Verdana'].find((f) => fams.includes(f)) || (fams[0] || 'sans-serif');
  const W = 1190, H = 1684; // A4 a 2x (escaneo)
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fdfdfa'; ctx.fillRect(0, 0, W, H); // papel
  ctx.fillStyle = '#1b1b1b';
  ctx.font = `bold 46px "${fam}"`;
  ctx.fillText('ACTA DE RECEPCION DE OBRA', 130, 180);
  ctx.font = `31px "${fam}"`;
  const lines = [
    'En la ciudad de Madrid, a 23 de junio de 2026, se reune la',
    'comision para la recepcion de las obras del edificio situado',
    'en la calle Mayor numero 15. El importe total asciende a',
    'cuarenta y dos mil euros (42.000 EUR), IVA incluido.',
    'Se aprueba por unanimidad la conformidad de los trabajos.',
  ];
  let y = 290;
  for (const ln of lines) { ctx.fillText(ln, 130, y); y += 62; }
  const png = canvas.toBuffer('image/png');
  const out = await PDFDocument.create();
  const img = await out.embedPng(png);
  const pg = out.addPage([595, 842]);
  pg.drawImage(img, { x: 0, y: 0, width: 595, height: 842 });
  fs.writeFileSync('C:/Users/Carlos Relaño/Desktop/test-escaneado.pdf', await out.save());
  console.log('test-escaneado.pdf creado con fuente:', fam);
})();
