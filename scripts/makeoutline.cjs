const { PDFDocument, StandardFonts, rgb, PDFName, PDFHexString } = require('@cantoo/pdf-lib');
const fs = require('fs');
(async () => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const titles = ['Portada','Introduccion','Presupuesto','Mediciones','Anexos'];
  const pages = [];
  for (let i=0;i<5;i++){ const p = doc.addPage([595,842]); pages.push(p);
    p.drawText(titles[i], { x:60, y:760, size:30, font, color: rgb(0.28,0.69,0.70) });
    p.drawText('Pagina '+(i+1), { x:60, y:710, size:14, font, color: rgb(0.2,0.2,0.2) }); }
  // construir un outline (indice) manual
  const context = doc.context;
  const refs = titles.map(()=>context.nextRef());
  const outlineRef = context.nextRef();
  const items = titles.map((t,i)=>{
    const dict = context.obj({ Parent: outlineRef, Dest: [pages[i].ref, 'XYZ', null, 842, null] });
    dict.set(PDFName.of('Title'), PDFHexString.fromText(t)); // título como cadena de texto válida
    return dict;
  });
  items.forEach((it,i)=>{ if(i>0) it.set(PDFName.of('Prev'), refs[i-1]); if(i<items.length-1) it.set(PDFName.of('Next'), refs[i+1]); context.assign(refs[i], it); });
  const outlineDict = context.obj({ Type: 'Outlines', First: refs[0], Last: refs[refs.length-1], Count: titles.length });
  context.assign(outlineRef, outlineDict);
  doc.catalog.set(PDFName.of('Outlines'), outlineRef);
  fs.writeFileSync('C:/Users/Carlos Relaño/Desktop/test-indice.pdf', await doc.save());
  console.log('test-indice.pdf creado con indice de 5 secciones');
})();
