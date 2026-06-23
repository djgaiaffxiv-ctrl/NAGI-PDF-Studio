// Copia los builds de las librerías a src/vendor para usarlos en la app sin bundler.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const vendor = path.join(root, 'src', 'vendor');
fs.mkdirSync(vendor, { recursive: true });

const files = [
  ['node_modules/@cantoo/pdf-lib/dist/pdf-lib.min.js', 'pdf-lib.min.js'],
  ['node_modules/pdfjs-dist/legacy/build/pdf.min.mjs', 'pdf.min.mjs'],
  ['node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs', 'pdf.worker.min.mjs'],
];

for (const [from, to] of files) {
  const src = path.join(root, from);
  const dst = path.join(vendor, to);
  fs.copyFileSync(src, dst);
  const kb = (fs.statSync(dst).size / 1024).toFixed(0);
  console.log(`✓ ${to} (${kb} KB)`);
}
console.log('Vendor listo.');
