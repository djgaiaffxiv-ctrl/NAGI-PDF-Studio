const { PDFDocument, StandardFonts, rgb } = require('@cantoo/pdf-lib');
const fs = require('fs');
(async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const form = doc.getForm();
  page.drawText('FORMULARIO DE PRUEBA - NAGI PDF STUDIO', { x: 50, y: 790, size: 16, font, color: rgb(0.28, 0.69, 0.70) });

  const label = (t, y) => page.drawText(t, { x: 50, y, size: 12, font, color: rgb(0.15, 0.15, 0.15) });

  label('Nombre:', 742);
  form.createTextField('nombre').addToPage(page, { x: 140, y: 735, width: 320, height: 24 });

  label('Email:', 702);
  form.createTextField('email').addToPage(page, { x: 140, y: 695, width: 320, height: 24 });

  label('Departamento:', 662);
  const dep = form.createDropdown('departamento');
  dep.addOptions(['Oficina Tecnica', 'Administracion', 'Produccion', 'RRHH']);
  dep.addToPage(page, { x: 160, y: 655, width: 220, height: 24 });

  label('Acepto las condiciones:', 615);
  form.createCheckBox('acepto').addToPage(page, { x: 250, y: 613, width: 18, height: 18 });

  fs.writeFileSync('C:\\Users\\Carlos Relaño\\Desktop\\test-form.pdf', await doc.save());
  console.log('PDF con formulario creado: test-form.pdf');
})();
