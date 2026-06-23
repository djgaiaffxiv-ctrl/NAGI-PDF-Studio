const { PDFDocument } = require('@cantoo/pdf-lib');
const fs = require('fs');
(async () => {
  const doc = await PDFDocument.load(fs.readFileSync(process.argv[2]));
  const form = doc.getForm();
  for (const f of form.getFields()) {
    const t = f.constructor.name;
    let v = '';
    try { if (t==='PDFTextField') v=f.getText(); else if (t==='PDFCheckBox') v=f.isChecked()?'[X]':'[ ]'; else if (t==='PDFDropdown') v=(f.getSelected()||[]).join(','); } catch(e){}
    console.log(`  ${f.getName()} (${t}): ${v}`);
  }
})();
