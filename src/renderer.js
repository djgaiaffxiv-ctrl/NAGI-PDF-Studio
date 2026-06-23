// ===== Nagi PDF Studio — lógica de la aplicación =====
import * as pdfjsLib from './vendor/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdf.worker.min.mjs', import.meta.url).href;

const { PDFDocument, degrees, rgb, StandardFonts } = window.PDFLib;

/* ---------------- Helpers DOM ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
function el(tag, props = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c) n.append(c.nodeType ? c : document.createTextNode(c));
  return n;
}

/* ---------------- Iconos (SVG) ---------------- */
const I = {
  merge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="9" height="7" rx="1.5"/><rect x="12" y="14" width="9" height="7" rx="1.5"/><path d="M7.5 10v4.5a2 2 0 0 0 2 2H12"/></svg>',
  split: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18" rx="1.5"/><rect x="14" y="3" width="7" height="18" rx="1.5"/></svg>',
  organize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/></svg>',
  compress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v4M9 17v4M5 7h8M5 17h8"/><path d="M17 7l3 3-3 3"/></svg>',
  img2pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  pdf2img: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><circle cx="10" cy="13" r="1.3"/><path d="M16 18l-3-3-5 4"/></svg>',
  protect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  watermark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z"/></svg>',
  numbers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h2v10"/><path d="M11 9a2 2 0 1 1 3.4 1.4L11 17h5"/></svg>',
  sign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19c3 0 4-9 6-9s2 6 4 6 2-4 4-4 2 2 4 2"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M5 20h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
  rot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
  saveas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7M16 3l5 5M14 3v5h5"/><path d="M16 19h6M19 16v6"/></svg>',
  rotpage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8" width="10" height="13" rx="1.5"/><path d="M15 4a5 5 0 0 1 4 4M19 3v3h-3"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  zoomin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>',
  zoomout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/></svg>',
  fitwidth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="12" rx="1.5"/><path d="M2 12h2M20 12h2M8 9l-2 3 2 3M16 9l2 3-2 3"/></svg>',
  fitpage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M9 7l-2-2 2-2M15 7l2-2-2-2" transform="translate(0,2)"/></svg>',
  sidebar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  marker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 4.5l4 4-9 9-4 1 1-4 8-10z"/><path d="M13.5 6.5l4 4"/><path d="M5 21h14"/></svg>',
  text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h14M12 5v14M9 19h6"/></svg>',
  cover: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="10" rx="1.5"/></svg>',
  edittext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5h11v2M9.5 5v11M7.5 16h4"/><path d="M20.5 11.5l-5 5-2.5.7.7-2.5 5-5a1.2 1.2 0 0 1 1.8 1.8z"/></svg>',
  rect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="12" rx="1.5"/></svg>',
  ellipse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="12" rx="8" ry="6"/></svg>',
  line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 19L19 5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19L19 5M19 5h-7M19 5v7"/></svg>',
  snapshot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  sign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17c3 0 4-9 6-9s2 6 4 6 2-4 4-4 2 2 4 2"/><path d="M3 21h18"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v11l-5 5H4z"/><path d="M20 15h-5v5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z"/></svg>',
  index: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5h12M8 12h12M8 19h12"/><circle cx="3.5" cy="5" r="1.2"/><circle cx="3.5" cy="12" r="1.2"/><circle cx="3.5" cy="19" r="1.2"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z"/></svg>',
  starf: '<svg viewBox="0 0 24 24" fill="var(--amber)" stroke="var(--amber)" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z"/></svg>',
  ocr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8h7M7 12h10M7 16h6"/></svg>',
  move: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M9 5l3-3 3 3M9 19l3 3 3-3M5 9l-3 3 3 3M19 9l3 3-3 3"/></svg>',
};

/* ---------------- Avisos / carga ---------------- */
function toast(msg, type = 'ok') {
  const t = el('div', { class: 'toast' + (type === 'err' ? ' err' : type === 'warn' ? ' warn' : ''), text: msg });
  $('#toasts').append(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 320); }, 4200);
}
function busy(on, text = 'Procesando…') {
  $('#overlay-text').textContent = text;
  $('#overlay').hidden = !on;
}
const fmtBytes = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(2) + ' MB';

// Convierte un dataURL (base64) en bytes — fiable para incrustar en pdf-lib.
function dataUrlToBytes(dataUrl) {
  const bin = atob(dataUrl.split(',')[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
function bytesToB64(bytes) {
  let s = ''; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  return btoa(s);
}
function loadImg(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }); }
// carga una imagen desde bytes crudos (el navegador detecta el formato) vía blob URL
async function loadBytesImg(bytes) {
  const url = URL.createObjectURL(new Blob([bytes]));
  try { return await loadImg(url); } finally { URL.revokeObjectURL(url); }
}
// Convierte una firma ESCANEADA (foto sobre papel) en PNG digital limpio.
// Estrategia robusta para FOTOS con iluminación irregular:
//   1) umbral ADAPTATIVO: cada píxel se compara con el brillo LOCAL del papel
//      (media en una ventana grande, vía imagen integral) en vez de un valor fijo.
//      Así una sombra o un papel grisáceo no se cuela como tinta: el fondo local
//      baja con la sombra y el contraste relativo se mantiene.
//   2) eliminación de MOTAS: se descartan las manchitas sueltas (polvo, textura,
//      bloques JPEG) quedándose solo con los trazos grandes y conectados.
//   3) realce suave del trazo + recorte al contenido.
function processScan(im, inkCss) {
  const ink = (inkCss || '#15324a').replace('#', '');
  const ir = parseInt(ink.slice(0, 2), 16), ig = parseInt(ink.slice(2, 4), 16), ib = parseInt(ink.slice(4, 6), 16);
  const maxDim = 1500;
  let w = im.naturalWidth, h = im.naturalHeight;
  const sc = Math.min(1, maxDim / Math.max(w, h)); w = Math.max(1, Math.round(w * sc)); h = Math.max(1, Math.round(h * sc));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const cx = c.getContext('2d', { willReadFrequently: true }); cx.drawImage(im, 0, 0, w, h);
  const img = cx.getImageData(0, 0, w, h); const d = img.data;
  const N = w * h;

  // --- 1) luminancia ---
  const lum = new Float32Array(N);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) lum[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

  // --- 2) imagen integral para la media local (estima la iluminación del papel) ---
  const W1 = w + 1;
  const integ = new Float64Array(W1 * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowsum = 0; const o = (y + 1) * W1, op = y * W1, row = y * w;
    for (let x = 0; x < w; x++) { rowsum += lum[row + x]; integ[o + x + 1] = integ[op + x + 1] + rowsum; }
  }
  const rad = Math.max(12, Math.round(Math.min(w, h) / 12)); // radio de ventana local
  const meanAt = (x, y) => {
    const x0 = x - rad < 0 ? 0 : x - rad, y0 = y - rad < 0 ? 0 : y - rad;
    const x1 = x + rad >= w ? w - 1 : x + rad, y1 = y + rad >= h ? h - 1 : y + rad;
    const area = (x1 - x0 + 1) * (y1 - y0 + 1);
    const s = integ[(y1 + 1) * W1 + (x1 + 1)] - integ[y0 * W1 + (x1 + 1)] - integ[(y1 + 1) * W1 + x0] + integ[y0 * W1 + x0];
    return s / area;
  };

  // --- 3) alpha por oscuridad RELATIVA al fondo local (k = 0 papel … 1 tinta plena) ---
  const kLo = 0.06, kHi = 0.20; // por debajo de kLo = fondo; por encima de kHi = tinta plena
  const alpha = new Uint8ClampedArray(N);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const p = row + x; const m = meanAt(x, y) || 1;
      let k = (m - lum[p]) / m; if (k < 0) k = 0;
      alpha[p] = k <= kLo ? 0 : (k >= kHi ? 255 : Math.round((k - kLo) / (kHi - kLo) * 255));
    }
  }

  // --- 4) eliminar motas: borra componentes conexas pequeñas (8-conexión) ---
  const mask = new Uint8Array(N);
  for (let p = 0; p < N; p++) mask[p] = alpha[p] > 40 ? 1 : 0;
  const minArea = Math.max(14, Math.round(N * 0.00012)); // tamaño mínimo de un trazo real (lo menor = mota)
  const seen = new Uint8Array(N);
  const stack = new Int32Array(N);
  const comp = new Int32Array(N);
  for (let s = 0; s < N; s++) {
    if (!mask[s] || seen[s]) continue;
    let top = 0, n = 0; stack[top++] = s; seen[s] = 1;
    while (top > 0) {
      const p = stack[--top]; comp[n++] = p;
      const px = p % w, py = (p - px) / w;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = py + dy; if (ny < 0 || ny >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue; const nx = px + dx; if (nx < 0 || nx >= w) continue;
          const np = ny * w + nx; if (mask[np] && !seen[np]) { seen[np] = 1; stack[top++] = np; }
        }
      }
    }
    if (n < minArea) for (let k = 0; k < n; k++) alpha[comp[k]] = 0; // descartar mota
  }

  // --- 5) realce suave del trazo, recolorear a tinta y calcular recorte ---
  let minX = w, minY = h, maxX = 0, maxY = 0, any = false;
  for (let p = 0, i = 0; p < N; p++, i += 4) {
    let a = alpha[p];
    if (a > 0) a = Math.round(255 * Math.pow(a / 255, 0.85)); // realce ligero, sin inflar ruido
    d[i] = ir; d[i + 1] = ig; d[i + 2] = ib; d[i + 3] = a;
    if (a > 26) { any = true; const px = p % w, py = (p - px) / w; if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py; }
  }
  cx.putImageData(img, 0, 0);
  if (!any) return { dataUrl: c.toDataURL('image/png'), ar: w / h };
  const mg = Math.round(Math.max(w, h) * 0.02);
  minX = Math.max(0, minX - mg); minY = Math.max(0, minY - mg); maxX = Math.min(w - 1, maxX + mg); maxY = Math.min(h - 1, maxY + mg);
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const c2 = document.createElement('canvas'); c2.width = cw; c2.height = ch;
  c2.getContext('2d').drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch);
  return { dataUrl: c2.toDataURL('image/png'), ar: cw / ch };
}

/* ---------------- Render con pdf.js ---------------- */
async function loadPdfjs(bytes) {
  // pdf.js consume el buffer, así que le pasamos una copia
  return pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
}
async function renderPage(pdf, pageNum, scale = 1) {
  const page = await pdf.getPage(pageNum);
  const vp = page.getViewport({ scale });
  const canvas = el('canvas');
  canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  return canvas;
}

/* ---------------- Definición de herramientas ---------------- */
const TOOLS = [
  { id: 'viewer', name: 'Visor de PDF', icon: I.view, group: 'Ver', desc: 'Abre y lee tus PDF: navega, haz zoom, ajusta a la página y ve las miniaturas.' },
  { id: 'merge', name: 'Unir PDF', icon: I.merge, group: 'Organizar', desc: 'Combina varios PDF en un solo documento, en el orden que quieras.' },
  { id: 'organize', name: 'Organizar páginas', icon: I.organize, group: 'Organizar', desc: 'Reordena arrastrando, gira o borra páginas concretas y guarda el resultado.' },
  { id: 'split', name: 'Dividir PDF', icon: I.split, group: 'Organizar', desc: 'Separa un PDF en varios: por página, por rangos o cada N páginas.' },
  { id: 'compress', name: 'Comprimir PDF', icon: I.compress, group: 'Optimizar', desc: 'Reduce el peso del archivo para enviarlo por email o subirlo.' },
  { id: 'img2pdf', name: 'Imágenes → PDF', icon: I.img2pdf, group: 'Convertir', desc: 'Convierte fotos o escaneos (JPG, PNG…) en un único PDF.' },
  { id: 'pdf2img', name: 'PDF → Imágenes', icon: I.pdf2img, group: 'Convertir', desc: 'Exporta cada página del PDF como imagen PNG o JPG.' },
  { id: 'protect', name: 'Proteger con contraseña', icon: I.protect, group: 'Proteger', desc: 'Cifra el PDF para que solo se abra con tu contraseña.' },
  { id: 'watermark', name: 'Marca de agua', icon: I.watermark, group: 'Proteger', desc: 'Estampa un texto (CONFIDENCIAL, tu nombre…) en todas las páginas.' },
  { id: 'numbers', name: 'Numerar páginas', icon: I.numbers, group: 'Proteger', desc: 'Añade números de página con el estilo y la posición que elijas.' },
  { id: 'sign', name: 'Firmar PDF', icon: I.sign, group: 'Proteger', desc: 'Dibuja tu firma y colócala en la página que quieras.' },
];
const GROUPS = ['Ver', 'Organizar', 'Optimizar', 'Convertir', 'Proteger'];

/* ---------------- Sidebar ---------------- */
function buildSidebar() {
  const sb = $('#sidebar');
  sb.innerHTML = '';
  sb.append(el('button', { class: 'side-home', onclick: () => openHome() }, [
    el('span', { class: 'side-ico', html: I.home }), 'Inicio',
  ]));
  for (const g of GROUPS) {
    sb.append(el('div', { class: 'side-group-label', text: g }));
    for (const t of TOOLS.filter((x) => x.group === g)) {
      sb.append(el('div', {
        class: 'side-item', 'data-id': t.id,
        onclick: () => openTool(t.id),
      }, [el('span', { class: 'side-ico', html: t.icon }), t.name]));
    }
  }
}
function setActive(id) {
  document.querySelectorAll('.side-item').forEach((n) => n.classList.toggle('active', n.dataset.id === id));
}

/* ---------------- Recientes ---------------- */
function getRecents() {
  try { return JSON.parse(localStorage.getItem('nagi_recents') || '[]'); } catch (e) { return []; }
}
function addRecent(path, name) {
  if (!path) return;
  let list = getRecents().filter((r) => r.path !== path);
  list.unshift({ path, name: name || path.split(/[\\/]/).pop(), ts: Date.now() });
  list = list.slice(0, 12);
  try { localStorage.setItem('nagi_recents', JSON.stringify(list)); } catch (e) {}
}
function removeRecent(path) {
  try { localStorage.setItem('nagi_recents', JSON.stringify(getRecents().filter((r) => r.path !== path))); } catch (e) {}
}
async function openRecent(path) {
  let f;
  try { f = await window.nagi.readFile(path); } catch (e) { f = null; }
  if (!f) { toast('Ese archivo ya no está disponible (movido o borrado).', 'warn'); removeRecent(path); openHome(); return; }
  openTool('viewer', [{ name: f.name, bytes: new Uint8Array(f.data), path: f.path }]);
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'hace un momento';
  const m = Math.floor(s / 60); if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60); if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24); if (d === 1) return 'ayer';
  if (d < 30) return `hace ${d} días`;
  return `hace ${Math.floor(d / 30)} mes(es)`;
}

/* ---------------- Home ---------------- */
function openHome() {
  setActive(null);
  const ws = $('#workspace');
  ws.classList.remove('viewer-mode');
  ws.innerHTML = '';
  ws.append(el('div', { class: 'home-hero' }, [
    el('h1', { html: 'Tu estudio de PDF, <span class="hl">premium y privado</span>.' }),
    el('p', { text: 'Elige una herramienta. Todo ocurre en tu ordenador — tus archivos nunca se suben a internet.' }),
    el('div', { class: 'privacy', html: I.protect + ' 100% offline · tus documentos no salen de tu PC' }),
  ]));
  const recents = getRecents();
  if (recents.length) {
    ws.append(el('div', { class: 'group-title group-title-row' }, [
      el('span', { html: I.clock + ' Recientes' }),
      el('button', { class: 'gt-clear', text: 'Vaciar', title: 'Vaciar la lista de recientes', onclick: () => { try { localStorage.removeItem('nagi_recents'); } catch (e) {} openHome(); } }),
    ]));
    const rg = el('div', { class: 'recent-grid' });
    for (const r of recents) {
      rg.append(el('button', { class: 'recent-card', title: r.path, onclick: () => openRecent(r.path) }, [
        el('div', { class: 'rc-ico', html: I.file }),
        el('div', { class: 'rc-info' }, [
          el('h4', { text: r.name }),
          el('p', { text: timeAgo(r.ts) }),
        ]),
      ]));
    }
    ws.append(rg);
  }
  for (const g of GROUPS) {
    ws.append(el('div', { class: 'group-title', text: g }));
    const grid = el('div', { class: 'tool-grid' });
    for (const t of TOOLS.filter((x) => x.group === g)) {
      grid.append(el('button', { class: 'tool-card', onclick: () => openTool(t.id) }, [
        el('div', { class: 'tc-ico', html: t.icon }),
        el('h3', { text: t.name }),
        el('p', { text: t.desc }),
      ]));
    }
    ws.append(grid);
  }
}

/* ---------------- Marco de una herramienta ---------------- */
function toolFrame(tool) {
  setActive(tool.id);
  const ws = $('#workspace');
  ws.classList.remove('viewer-mode');
  ws.innerHTML = '';
  ws.append(el('div', { class: 'tool-head' }, [
    el('div', { class: 'th-ico', html: tool.icon }),
    el('div', {}, [el('h2', { text: tool.name }), el('p', { text: tool.desc })]),
  ]));
  const body = el('div', { class: 'tool-body' });
  ws.append(body);
  return body;
}

/* Dropzone reutilizable. accept: 'pdf' | 'image' ; multiple bool */
function dropzone(body, { accept, multiple, label, sub, onfiles }) {
  const isImg = accept === 'image';
  const dz = el('div', { class: 'dropzone' }, [
    el('div', { class: 'dz-ico', html: I.upload }),
    el('h4', { text: label }),
    el('p', { text: sub }),
    el('button', { class: 'btn btn-primary', html: I.upload + ' Elegir archivo' + (multiple ? 's' : '') }),
  ]);
  const pick = async () => {
    const files = await (isImg ? window.nagi.openImages() : window.nagi.openPdfs());
    if (files && files.length) onfiles(files.map((f) => ({ name: f.name, bytes: new Uint8Array(f.data) })));
  };
  dz.addEventListener('click', pick);
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('drag'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
  dz.addEventListener('drop', async (e) => {
    e.preventDefault(); dz.classList.remove('drag');
    const dropped = [...e.dataTransfer.files].filter((f) =>
      isImg ? f.type.startsWith('image/') : f.name.toLowerCase().endsWith('.pdf'));
    if (!dropped.length) return;
    const out = [];
    for (const f of dropped) out.push({ name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) });
    onfiles(out);
  });
  body.append(dz);
  return dz;
}

/* Guardar bytes con diálogo */
async function savePdf(bytes, defaultName) {
  const p = await window.nagi.save(defaultName, bytes, [{ name: 'PDF', extensions: ['pdf'] }]);
  if (p) { toast('Guardado: ' + p.split(/[\\/]/).pop()); return p; }
  return null;
}
function resultCard(body, title, sub, savedPath) {
  const card = el('div', { class: 'result' }, [
    el('div', { class: 'r-ico', html: I.check }),
    el('div', {}, [el('h4', { text: title }), el('p', { text: sub })]),
  ]);
  if (savedPath) {
    const folder = savedPath.replace(/[\\/][^\\/]*$/, '');
    card.append(el('div', { class: 'r-actions' }, [
      el('button', { class: 'btn btn-ghost', html: I.folder + ' Abrir carpeta', onclick: () => window.nagi.openPath(folder) }),
    ]));
  }
  body.append(card);
  return card;
}

/* ---------- Visor de impresión premium ---------- */
function parsePages(str, total) {
  const set = new Set();
  for (const part of String(str).split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) { let a = +m[1], b = +m[2]; if (a > b) [a, b] = [b, a]; for (let i = a; i <= b; i++) if (i >= 1 && i <= total) set.add(i); }
    else if (/^\d+$/.test(part)) { const i = +part; if (i >= 1 && i <= total) set.add(i); }
  }
  return [...set].sort((a, b) => a - b);
}
function pagesToRanges(pages) {
  const r = []; let start = null, prev = null;
  for (const p of pages) {
    if (start === null) { start = prev = p; continue; }
    if (p === prev + 1) { prev = p; continue; }
    r.push({ from: start - 1, to: prev - 1 }); start = prev = p;
  }
  if (start !== null) r.push({ from: start - 1, to: prev - 1 });
  return r;
}

async function openPrintPreview({ pdf, bytes, numPages, current }) {
  let pages = Array.from({ length: numPages }, (_, i) => i + 1);
  let io = null;

  const overlay = el('div', { class: 'pp-overlay' });
  const close = () => { if (io) io.disconnect(); overlay.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };

  const printerSel = el('select', {});
  const copiesIn = el('input', { type: 'number', min: '1', value: '1' });
  const modeAll = el('input', { type: 'radio', name: 'pprange', checked: 'checked' });
  const modeCur = el('input', { type: 'radio', name: 'pprange' });
  const modeCustom = el('input', { type: 'radio', name: 'pprange' });
  const customIn = el('input', { type: 'text', placeholder: 'ej.: 1-3, 5', disabled: '' });
  const summary = el('div', { class: 'pp-summary' });

  const settings = el('div', { class: 'pp-settings' }, [
    el('div', { class: 'field' }, [el('label', { text: 'Impresora' }), printerSel]),
    el('div', { class: 'field' }, [el('label', { text: 'Copias' }), copiesIn]),
    el('div', { class: 'field' }, [
      el('label', { text: 'Páginas' }),
      el('div', { class: 'pp-range-modes' }, [
        el('label', { class: 'check' }, [modeAll, `Todas (${numPages})`]),
        el('label', { class: 'check' }, [modeCur, `Página actual (${current})`]),
        el('label', { class: 'check' }, [modeCustom, 'Personalizado']),
        customIn,
      ]),
    ]),
    summary,
  ]);

  const preview = el('div', { class: 'pp-preview' });
  const printBtn = el('button', { class: 'btn btn-primary', html: I.print + ' Imprimir', onclick: doPrint });
  const modal = el('div', { class: 'pp-modal' }, [
    el('div', { class: 'pp-head' }, [
      el('div', { class: 'pp-ico', html: I.print }),
      el('h3', { text: 'Imprimir' }),
      el('span', { class: 'pp-jp', text: '工' }),
      el('button', { class: 'icon-btn pp-x', html: I.x, title: 'Cerrar', onclick: close }),
    ]),
    el('div', { class: 'pp-body' }, [settings, preview]),
    el('div', { class: 'pp-foot' }, [
      el('span', { class: 'pp-hint', text: '凪 La impresión ocurre en tu equipo' }),
      el('div', { class: 'pp-actions' }, [
        el('button', { class: 'btn btn-ghost', text: 'Cancelar', onclick: close }),
        printBtn,
      ]),
    ]),
  ]);
  overlay.append(el('div', { class: 'pp-frame' }, [modal]));
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);
  document.body.append(overlay);

  // impresoras
  let printers = [];
  try { printers = await window.nagi.getPrinters(); } catch (e) {}
  if (printers && printers.length) {
    for (const p of printers) {
      printerSel.append(el('option', { value: p.name, text: (p.displayName || p.name) + (p.isDefault ? ' (predeterminada)' : '') }));
    }
    const def = printers.find((p) => p.isDefault);
    if (def) printerSel.value = def.name;
  } else {
    printerSel.append(el('option', { value: '', text: 'Diálogo del sistema' }));
  }

  function recompute() {
    if (modeAll.checked) { pages = Array.from({ length: numPages }, (_, i) => i + 1); customIn.disabled = true; }
    else if (modeCur.checked) { pages = [current]; customIn.disabled = true; }
    else { customIn.disabled = false; pages = parsePages(customIn.value, numPages); }
    summary.textContent = pages.length
      ? `${pages.length} página(s) · ${Math.max(1, parseInt(copiesIn.value) || 1)} copia(s)`
      : 'Escribe un rango válido (ej.: 1-3, 5)';
    buildPreview();
  }
  [modeAll, modeCur, modeCustom].forEach((r) => r.addEventListener('change', recompute));
  customIn.addEventListener('input', () => { modeCustom.checked = true; recompute(); });
  copiesIn.addEventListener('input', recompute);

  function buildPreview() {
    if (io) io.disconnect();
    preview.innerHTML = '';
    if (!pages.length) { preview.append(el('div', { class: 'empty-mini', text: 'No hay páginas que mostrar.' })); return; }
    io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) renderSheet(e.target);
    }, { root: preview, rootMargin: '350px 0px' });
    for (const n of pages) {
      const sheet = el('div', { class: 'pp-sheet pp-sheet-ph', 'data-n': n, style: 'width:460px;height:650px' }, [el('div', { class: 'vpage-spin' })]);
      preview.append(sheet);
      io.observe(sheet);
    }
  }

  async function renderSheet(sheet) {
    if (sheet.dataset.r) return;
    sheet.dataset.r = '1';
    const n = +sheet.dataset.n;
    try {
      const page = await pdf.getPage(n);
      const vp0 = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: 460 / vp0.width });
      const canvas = el('canvas');
      canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      sheet.classList.remove('pp-sheet-ph');
      sheet.style.width = ''; sheet.style.height = '';
      sheet.innerHTML = '';
      sheet.append(canvas, el('div', { class: 'pp-snum', text: 'Página ' + n }));
    } catch (e) { /* página ilegible */ }
  }

  async function doPrint() {
    if (!pages.length) { toast('Escribe un rango de páginas válido.', 'warn'); return; }
    const options = {
      deviceName: printerSel.value || undefined,
      copies: Math.max(1, parseInt(copiesIn.value) || 1),
      pageRanges: modeAll.checked ? undefined : pagesToRanges(pages),
    };
    close();
    busy(true, 'Enviando a la impresora…');
    let ok = false;
    try { ok = await window.nagi.print(bytes, options); } catch (e) { ok = false; } finally { busy(false); }
    toast(ok ? 'Documento enviado a la impresora.' : 'No se pudo imprimir.', ok ? 'ok' : 'warn');
  }

  recompute();
}

/* ====================================================================
   HERRAMIENTAS
==================================================================== */
function openTool(id, initialFiles) {
  const t = TOOLS.find((x) => x.id === id);
  ({
    viewer: toolViewer,
    merge: toolMerge, organize: toolOrganize, split: toolSplit, compress: toolCompress,
    img2pdf: toolImg2Pdf, pdf2img: toolPdf2Img, protect: toolProtect,
    watermark: toolWatermark, numbers: toolNumbers, sign: toolSign,
  })[id](t, initialFiles);
}

/* ---------- 0. VISOR ---------- */
// Estado del visor con PESTAÑAS (persiste entre aperturas). Cada doc es una pestaña.
const VIEWER = { docs: [], active: -1, tool: null, activeTool: '', markColor: 'yellow', textColor: 'black', textSize: 13, shapeColor: 'red' };
const SHAPE_COLORS = {
  red: { css: '#d92d2d', rgb: [0.85, 0.18, 0.18] },
  blue: { css: '#2a59c7', rgb: [0.16, 0.35, 0.78] },
  green: { css: '#1f9d57', rgb: [0.12, 0.62, 0.34] },
  amber: { css: '#F7AA3E', rgb: [0.97, 0.67, 0.24] },
  black: { css: '#1a1a1a', rgb: [0.1, 0.1, 0.1] },
};
const TEXT_COLORS = { black: [0.1, 0.1, 0.1], red: [0.85, 0.18, 0.18], blue: [0.16, 0.35, 0.78], white: [1, 1, 1] };
const TEXT_COLOR_CSS = { black: '#1a1a1a', red: '#d92d2d', blue: '#2a59c7', white: '#ffffff' };
// El color de un texto puede ser una clave de la paleta o un rgb [0-1] (detectado del PDF).
function colorToCss(c) { return Array.isArray(c) ? `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})` : (TEXT_COLOR_CSS[c] || '#1a1a1a'); }
function colorToRgb(c) { return Array.isArray(c) ? c : (TEXT_COLORS[c] || [0.1, 0.1, 0.1]); }
function escapeHtml(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
// SVG de una forma entre dos puntos (en píxeles de pantalla). Usado para preview y render.
function shapeSvg(shape, x1, y1, x2, y2, colorCss, lw) {
  const pad = lw + 8;
  const minX = Math.min(x1, x2), minY = Math.min(y1, y2);
  const W = Math.abs(x2 - x1), H = Math.abs(y2 - y1);
  const sw = W + pad * 2, sh = H + pad * 2;
  const lx1 = x1 - minX + pad, ly1 = y1 - minY + pad, lx2 = x2 - minX + pad, ly2 = y2 - minY + pad;
  let inner = '';
  if (shape === 'rect') inner = `<rect x="${pad}" y="${pad}" width="${W}" height="${H}" rx="2" fill="none" stroke="${colorCss}" stroke-width="${lw}"/>`;
  else if (shape === 'ellipse') inner = `<ellipse cx="${pad + W / 2}" cy="${pad + H / 2}" rx="${W / 2}" ry="${H / 2}" fill="none" stroke="${colorCss}" stroke-width="${lw}"/>`;
  else if (shape === 'line') inner = `<line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="${colorCss}" stroke-width="${lw}" stroke-linecap="round"/>`;
  else if (shape === 'arrow') {
    const ang = Math.atan2(ly2 - ly1, lx2 - lx1), ah = Math.max(9, lw * 3.4);
    const a1x = lx2 - ah * Math.cos(ang - Math.PI / 6), a1y = ly2 - ah * Math.sin(ang - Math.PI / 6);
    const a2x = lx2 - ah * Math.cos(ang + Math.PI / 6), a2y = ly2 - ah * Math.sin(ang + Math.PI / 6);
    inner = `<line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="${colorCss}" stroke-width="${lw}" stroke-linecap="round"/><polyline points="${a1x},${a1y} ${lx2},${ly2} ${a2x},${a2y}" fill="none" stroke="${colorCss}" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', sw); svg.setAttribute('height', sh); svg.setAttribute('viewBox', `0 0 ${sw} ${sh}`);
  svg.style.cssText = `position:absolute;left:${minX - pad}px;top:${minY - pad}px;pointer-events:none;overflow:visible`;
  svg.innerHTML = inner;
  return svg;
}
// Convierte el HTML editable en líneas de "trozos" con formato {text,b,i,u} para incrustar en el PDF.
function parseRuns(html) {
  const root = document.createElement('div');
  root.innerHTML = html || '';
  const lines = [[]];
  const fmtFrom = (elm, base) => {
    const f = { b: base.b, i: base.i, u: base.u };
    const tag = elm.tagName;
    if (tag === 'B' || tag === 'STRONG') f.b = true;
    if (tag === 'I' || tag === 'EM') f.i = true;
    if (tag === 'U') f.u = true;
    const st = elm.style || {};
    if (/bold|[6-9]00/.test(st.fontWeight || '')) f.b = true;
    if ((st.fontStyle || '') === 'italic') f.i = true;
    if (((st.textDecoration || '') + (st.textDecorationLine || '')).includes('underline')) f.u = true;
    return f;
  };
  const walk = (node, fmt) => {
    for (const ch of node.childNodes) {
      if (ch.nodeType === 3) {
        if (ch.nodeValue) lines[lines.length - 1].push({ text: ch.nodeValue, b: fmt.b, i: fmt.i, u: fmt.u });
      } else if (ch.nodeType === 1) {
        const tag = ch.tagName;
        if (tag === 'BR') { lines.push([]); }
        else if (tag === 'DIV' || tag === 'P') { lines.push([]); walk(ch, fmtFrom(ch, fmt)); }
        else walk(ch, fmtFrom(ch, fmt));
      }
    }
  };
  walk(root, { b: false, i: false, u: false });
  while (lines.length > 1 && !lines[0].length) lines.shift();
  while (lines.length > 1 && !lines[lines.length - 1].length) lines.pop();
  return lines;
}
// Paleta premium del resaltador (css para pantalla, rgb 0-1 para incrustar en el PDF)
const MARK_COLORS = {
  yellow: { css: '#FFE45C', rgb: [1.0, 0.894, 0.361] },
  turq: { css: '#47AFB3', rgb: [0.28, 0.69, 0.70] },
  amber: { css: '#F7AA3E', rgb: [0.97, 0.67, 0.24] },
  pink: { css: '#EC8584', rgb: [0.93, 0.52, 0.52] },
  violet: { css: '#8C7BF0', rgb: [0.55, 0.48, 0.94] },
};
function newDoc(f) { return { name: f.name, bytes: f.bytes, path: f.path || null, pdf: null, base: null, numPages: 0, scale: null, rotation: 0, pageRot: {}, current: 1, marks: [], edits: [], history: [] }; }
// Atajos globales del visor — se enlazan una sola vez y llaman al doc activo.
let _keysBound = false;
function bindKeys() {
  if (_keysBound) return; _keysBound = true;
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
      const ae = document.activeElement;
      if (ae && ae.classList && ae.classList.contains('vedit-input')) return; // deshacer nativo dentro del texto
      if (VIEWER.undoFn) { e.preventDefault(); VIEWER.undoFn(); }
      return;
    }
    if (VIEWER.viewerKeys) VIEWER.viewerKeys(e);
  });
}
// Arrastrar archivos PDF a la ventana → abrirlos en pestañas.
let _dropBound = false;
function bindDrop() {
  if (_dropBound) return; _dropBound = true;
  document.addEventListener('dragover', (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
  document.addEventListener('drop', async (e) => {
    const fs = [...((e.dataTransfer && e.dataTransfer.files) || [])].filter((f) => /\.pdf$/i.test(f.name));
    if (!fs.length) return;
    e.preventDefault();
    const out = [];
    for (const f of fs) out.push({ name: f.name, bytes: new Uint8Array(await f.arrayBuffer()), path: f.path || null });
    openTool('viewer', out);
  });
}
// Lee y cachea el texto de una página (para buscar): {text, items[{str,start,end,tr,width}]}
async function getPageText(doc, n) {
  doc._textCache = doc._textCache || {};
  if (doc._textCache[n]) return doc._textCache[n];
  // Si la página fue reconocida con OCR, usar ese texto (palabras con posición)
  if (doc.ocr && doc.ocr[n] && doc.ocr[n].words && doc.ocr[n].words.length) {
    let so = ''; const itemsO = [];
    for (const w of doc.ocr[n].words) {
      const start = so.length; const str = w.text + ' '; so += str;
      itemsO.push({ str, start, end: so.length, tr: [w.size, 0, 0, w.size, w.x, w.y], width: w.w });
    }
    doc._textCache[n] = { text: so, items: itemsO };
    return doc._textCache[n];
  }
  const page = await doc.pdf.getPage(n);
  const tc = await page.getTextContent();
  let s = ''; const items = [];
  for (const it of tc.items) {
    if (typeof it.str !== 'string') continue;
    const start = s.length;
    s += it.str;
    items.push({ str: it.str, start, end: s.length, tr: it.transform, width: it.width });
    if (it.hasEOL) s += '\n';
  }
  doc._textCache[n] = { text: s, items };
  return doc._textCache[n];
}
// Campos de formulario (widgets) de una página, cacheados.
async function getPageAnnots(doc, n) {
  doc._annotCache = doc._annotCache || {};
  if (doc._annotCache[n]) return doc._annotCache[n];
  let list = [];
  try {
    const page = await doc.pdf.getPage(n);
    const ans = await page.getAnnotations();
    list = ans.filter((a) => a.subtype === 'Widget' && a.fieldType && a.fieldName && !a.hidden);
  } catch (e) {}
  doc._annotCache[n] = list;
  if (list.length && !doc._formToast) { doc._formToast = true; toast('Este PDF tiene un formulario — puedes rellenarlo.'); }
  return list;
}
function viewerAddFiles(files) {
  for (const f of files) { VIEWER.docs.push(newDoc(f)); if (f.path) addRecent(f.path, f.name); }
  VIEWER.active = VIEWER.docs.length - 1;
}
function closeViewerTab(i) {
  VIEWER.docs.splice(i, 1);
  if (VIEWER.active >= VIEWER.docs.length) VIEWER.active = VIEWER.docs.length - 1;
  renderViewer();
}
async function viewerPick() {
  const files = await window.nagi.openPdfs();
  if (files && files.length) { viewerAddFiles(files.map((f) => ({ name: f.name, bytes: new Uint8Array(f.data), path: f.path }))); renderViewer(); }
}

function toolViewer(tool, initialFiles) {
  VIEWER.tool = tool;
  setActive(tool.id);
  if (initialFiles && initialFiles.length) viewerAddFiles(initialFiles);
  renderViewer();
}

async function renderViewer() {
  const tool = VIEWER.tool;
  const ws = $('#workspace');

  // Sin documentos → zona para soltar/abrir un PDF
  if (!VIEWER.docs.length) {
    ws.classList.remove('viewer-mode');
    ws.innerHTML = '';
    ws.append(el('div', { class: 'tool-head' }, [
      el('div', { class: 'th-ico', html: tool.icon }),
      el('div', {}, [el('h2', { text: tool.name }), el('p', { text: tool.desc })]),
    ]));
    dropzone(ws, {
      accept: 'pdf', multiple: true,
      label: 'Abre uno o varios PDF', sub: 'Cada PDF se abre en su propia pestaña. Navega, haz zoom y mira las miniaturas.',
      onfiles: (fs) => { viewerAddFiles(fs); renderViewer(); },
    });
    return;
  }

  ws.classList.add('viewer-mode');
  ws.innerHTML = '';
  const doc = VIEWER.docs[VIEWER.active];

  // ----- barra de pestañas -----
  const tabbar = el('div', { class: 'viewer-tabs' });
  VIEWER.docs.forEach((d, i) => {
    tabbar.append(el('div', {
      class: 'vtab' + (i === VIEWER.active ? ' active' : ''), title: d.name,
      onclick: () => { if (i !== VIEWER.active) { VIEWER.active = i; renderViewer(); } },
    }, [
      el('span', { class: 'vt-dot', html: I.view }),
      el('span', { class: 'vt-name', text: d.name }),
      el('span', { class: 'vt-close', html: I.x, title: 'Cerrar pestaña', onclick: (e) => { e.stopPropagation(); closeViewerTab(i); } }),
    ]));
  });
  tabbar.append(el('button', { class: 'vtab-new', html: I.upload, title: 'Abrir otro PDF', onclick: viewerPick }));

  // ----- cargar el documento activo si hace falta -----
  if (!doc.pdf) {
    busy(true, 'Abriendo PDF…');
    try {
      doc.pdf = await loadPdfjs(doc.bytes);
      doc.numPages = doc.pdf.numPages;
      doc.base = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const vp = (await doc.pdf.getPage(i)).getViewport({ scale: 1 });
        doc.base.push({ w: vp.width, h: vp.height });
      }
    } catch (e) { busy(false); toast('No se pudo abrir el PDF: ' + e.message, 'err'); }
    busy(false);
    if (!doc.pdf) { closeViewerTab(VIEWER.active); return; }
  }

  // ----- estado local del render (closures sobre `doc`) -----
  const firstTime = doc.scale == null;
  if (firstTime) doc.scale = 1.15;
  let scrollEl, thumbsEl, outlineEl, io = null, thumbIo = null, scrollRAF = null, viewerRoot = null;
  let pageInput = null, zoomLabel = null, thumbsBtn = null, outlineBtn = null, darkBtn = null, bookmarkBtn = null;
  if (VIEWER.darkRead == null) { try { VIEWER.darkRead = localStorage.getItem('nagi_darkread') === '1'; } catch (e) { VIEWER.darkRead = false; } }

  function dims(i) {
    const b = doc.base[i - 1];
    const rot = ((doc.rotation + (doc.pageRot[i] || 0)) % 180) !== 0;
    return { w: (rot ? b.h : b.w) * doc.scale, h: (rot ? b.w : b.h) * doc.scale };
  }
  function buildPages() {
    if (io) io.disconnect();
    scrollEl.innerHTML = '';
    io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) renderPage(+e.target.dataset.p);
    }, { root: scrollEl, rootMargin: '300px 0px' });
    for (let i = 1; i <= doc.numPages; i++) {
      const { w, h } = dims(i);
      const wrap = el('div', { class: 'vpage', 'data-p': i, style: `width:${w}px;height:${h}px` }, [
        el('div', { class: 'vpage-ph', style: `width:${w}px;height:${h}px` }, [el('div', { class: 'vpage-spin' })]),
      ]);
      scrollEl.append(wrap);
      io.observe(wrap);
    }
  }
  async function renderPage(i) {
    const wrap = scrollEl.querySelector(`.vpage[data-p="${i}"]`);
    const key = doc.scale + ':' + doc.rotation + ':' + (doc.pageRot[i] || 0);
    if (!wrap || wrap.dataset.r === key) return;
    wrap.dataset.r = key;
    const page = await doc.pdf.getPage(i);
    const vp = page.getViewport({ scale: doc.scale, rotation: (page.rotate + doc.rotation + (doc.pageRot[i] || 0)) % 360 });
    const canvas = el('canvas');
    canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    if (wrap.dataset.r === key) {
      wrap.innerHTML = '';
      wrap.append(canvas, el('div', { class: 'vmark-layer' }));
      wrap._vp = vp;
      renderMarks(wrap);
      // cargar los campos de formulario (asíncrono, sin bloquear el pintado)
      getPageAnnots(doc, i).then((annots) => { wrap._annots = annots; if (wrap.isConnected) renderMarks(wrap); });
    }
  }
  function renderMarks(wrap) {
    const layer = wrap.querySelector('.vmark-layer');
    if (!layer || !wrap._vp) return;
    layer.innerHTML = '';
    const pageNum = +wrap.dataset.p;
    // resaltados
    doc.marks.forEach((m) => {
      if (m.page !== pageNum) return;
      const v = wrap._vp.convertToViewportRectangle(m.rect);
      const left = Math.min(v[0], v[2]), top = Math.min(v[1], v[3]);
      const w = Math.abs(v[2] - v[0]), h = Math.abs(v[3] - v[1]);
      layer.append(el('div', {
        class: 'vmark', style: `left:${left}px;top:${top}px;width:${w}px;height:${h}px;--mc:${MARK_COLORS[m.color].css}`,
      }, [
        el('button', {
          class: 'vmark-del', html: I.x, title: 'Quitar marca',
          onclick: (e) => { e.stopPropagation(); snapshot(); const gi = doc.marks.indexOf(m); if (gi >= 0) doc.marks.splice(gi, 1); renderMarks(wrap); },
        }),
      ]));
    });
    // ediciones (tapar / texto)
    doc.edits.forEach((ed) => {
      if (ed.page !== pageNum) return;
      if (ed.type === 'cover') layer.append(makeCoverEl(wrap, ed));
      else if (ed.type === 'text') layer.append(makeTextEl(wrap, ed));
      else if (ed.type === 'shape') layer.append(makeShapeEl(wrap, ed));
      else if (ed.type === 'image') layer.append(makeImageEl(wrap, ed));
      else if (ed.type === 'note') layer.append(makeNoteEl(wrap, ed));
    });
    // coincidencias de búsqueda
    if (doc.search && doc.search.hits.length) {
      doc.search.hits.forEach((hit, hi) => {
        if (hit.page !== pageNum) return;
        for (const rc of hit.rects) {
          const v = wrap._vp.convertToViewportRectangle(rc);
          const left = Math.min(v[0], v[2]), top = Math.min(v[1], v[3]);
          const w = Math.abs(v[2] - v[0]), h = Math.abs(v[3] - v[1]);
          layer.append(el('div', { class: 'vsearch-hit' + (hi === doc.search.active ? ' active' : ''), style: `left:${left}px;top:${top}px;width:${w}px;height:${h}px` }));
        }
      });
    }
    // campos de formulario (rellenables)
    if (wrap._annots && wrap._annots.length) {
      for (const an of wrap._annots) { const node = makeFormField(wrap, an); if (node) layer.append(node); }
    }
  }
  function makeFormField(wrap, an) {
    if (!wrap._vp || an.readOnly) return null;
    const v = wrap._vp.convertToViewportRectangle(an.rect);
    const left = Math.min(v[0], v[2]), top = Math.min(v[1], v[3]);
    const w = Math.abs(v[2] - v[0]), h = Math.abs(v[3] - v[1]);
    const name = an.fieldName;
    doc.formValues = doc.formValues || {};
    const cur = doc.formValues[name] !== undefined ? doc.formValues[name] : an.fieldValue;
    const setVal = (val) => { doc.formValues[name] = val; };
    const pos = `left:${left}px;top:${top}px;width:${w}px;height:${h}px`;
    // Casilla / radio
    if (an.fieldType === 'Btn') {
      if (an.checkBox) {
        const on = an.exportValue || 'Yes';
        const box = el('div', { class: 'vform-field vform-checkbox', style: pos });
        const inp = el('input', { type: 'checkbox' });
        inp.checked = cur != null && cur !== 'Off' && (cur === on || cur === true);
        if (doc.formValues[name] === undefined) doc.formValues[name] = inp.checked ? on : 'Off';
        inp.addEventListener('change', () => setVal(inp.checked ? on : 'Off'));
        box.append(inp);
        return box;
      }
      if (an.radioButton) {
        const optVal = an.buttonValue || an.exportValue;
        if (!optVal) return null;
        const box = el('div', { class: 'vform-field vform-checkbox', style: pos });
        const inp = el('input', { type: 'radio', name: 'vform_' + name });
        inp.checked = cur === optVal;
        inp.addEventListener('change', () => { if (inp.checked) setVal(optVal); });
        box.append(inp);
        return box;
      }
      return null;
    }
    // Desplegable
    if (an.fieldType === 'Ch' && an.options && an.options.length) {
      const sel = el('select', { class: 'vform-field vform-select', style: `${pos};font-size:${Math.min(h * 0.62, 15)}px` });
      sel.append(el('option', { value: '', text: '—' }));
      an.options.forEach((o) => sel.append(el('option', { value: o.exportValue, text: o.displayValue || o.exportValue })));
      sel.value = cur || '';
      sel.addEventListener('change', () => setVal(sel.value));
      return sel;
    }
    // Texto
    if (an.fieldType === 'Tx') {
      const inp = el(an.multiLine ? 'textarea' : 'input', { class: 'vform-field vform-text', style: `${pos};font-size:${Math.min(h * 0.62, 16)}px` });
      if (!an.multiLine) inp.type = 'text';
      inp.value = cur || '';
      inp.addEventListener('input', () => setVal(inp.value));
      inp.addEventListener('keydown', (e) => e.stopPropagation());
      return inp;
    }
    return null;
  }
  function removeEdit(wrap, ed) { const gi = doc.edits.indexOf(ed); if (gi >= 0) doc.edits.splice(gi, 1); renderMarks(wrap); }
  function removeGroup(wrap, gid) {
    for (let i = doc.edits.length - 1; i >= 0; i--) if (doc.edits[i].gid === gid) doc.edits.splice(i, 1);
    scrollEl.querySelectorAll('.vpage').forEach((w) => renderMarks(w));
  }
  // Guardar un estado para poder deshacer (Ctrl+Z)
  function snapshot() {
    if (!doc.history) doc.history = [];
    doc.history.push({ marks: JSON.parse(JSON.stringify(doc.marks)), edits: JSON.parse(JSON.stringify(doc.edits)), pageRot: JSON.parse(JSON.stringify(doc.pageRot || {})) });
    if (doc.history.length > 60) doc.history.shift();
  }
  function undoLast() {
    if (!doc.history || !doc.history.length) { toast('Nada que deshacer.'); return; }
    const snap = doc.history.pop();
    doc.marks = snap.marks; doc.edits = snap.edits;
    const rotChanged = JSON.stringify(doc.pageRot || {}) !== JSON.stringify(snap.pageRot || {});
    doc.pageRot = snap.pageRot || {};
    if (rotChanged) { if (typeof relayout === 'function') relayout(); buildThumbs(); }
    if (scrollEl) scrollEl.querySelectorAll('.vpage').forEach((w) => renderMarks(w));
  }
  VIEWER.undoFn = undoLast;
  bindKeys();
  bindDrop();
  // arrastre genérico de un elemento de edición por su asa; al soltar, recalcula su PDF point
  function dragEdit(grip, box, wrap, ed) {
    grip.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      const r = wrap.getBoundingClientRect();
      const start = { mx: e.clientX, my: e.clientY, left: parseFloat(box.style.left), top: parseFloat(box.style.top) };
      const move = (ev) => {
        const nl = Math.max(0, start.left + (ev.clientX - start.mx));
        const nt = Math.max(0, start.top + (ev.clientY - start.my));
        box.style.left = nl + 'px'; box.style.top = nt + 'px';
      };
      const up = () => {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
        const p = wrap._vp.convertToPdfPoint(parseFloat(box.style.left), parseFloat(box.style.top));
        ed.px = p[0]; ed.py = p[1];
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });
  }
  // arrastre del elemento por su propio cuerpo (no por un asa); excluye los controles indicados
  function dragBody(box, wrap, ed, exclude) {
    box.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if (exclude && e.target.closest(exclude)) return; // sobre el asa de tamaño o la × → no mover
      e.preventDefault(); e.stopPropagation();
      let moved = false;
      const start = { mx: e.clientX, my: e.clientY, left: parseFloat(box.style.left), top: parseFloat(box.style.top) };
      const move = (ev) => {
        if (!moved) { snapshot(); moved = true; box.classList.add('vdragging'); }
        box.style.left = Math.max(0, start.left + (ev.clientX - start.mx)) + 'px';
        box.style.top = Math.max(0, start.top + (ev.clientY - start.my)) + 'px';
      };
      const up = () => {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
        box.classList.remove('vdragging');
        if (moved) { const p = wrap._vp.convertToPdfPoint(parseFloat(box.style.left), parseFloat(box.style.top)); ed.px = p[0]; ed.py = p[1]; }
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });
  }
  function makeCoverEl(wrap, ed) {
    const v = wrap._vp.convertToViewportRectangle(ed.rect);
    const left = Math.min(v[0], v[2]), top = Math.min(v[1], v[3]);
    const w = Math.abs(v[2] - v[0]), h = Math.abs(v[3] - v[1]);
    const c = ed.color || [1, 1, 1];
    const bg = `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
    return el('div', { class: 'vedit vedit-cover', style: `left:${left}px;top:${top}px;width:${w}px;height:${h}px;background:${bg}` }, [
      el('button', { class: 'vedit-del', html: I.x, title: 'Quitar', onclick: (e) => { e.stopPropagation(); snapshot(); removeEdit(wrap, ed); } }),
    ]);
  }
  function makeShapeEl(wrap, ed) {
    const p1 = wrap._vp.convertToViewportPoint(ed.pts[0], ed.pts[1]);
    const p2 = wrap._vp.convertToViewportPoint(ed.pts[2], ed.pts[3]);
    const lw = (ed.lw || 1.5) * doc.scale;
    const css = (SHAPE_COLORS[ed.color] || SHAPE_COLORS.red).css;
    const cont = el('div', { class: 'vedit vshape' }, [shapeSvg(ed.shape, p1[0], p1[1], p2[0], p2[1], css, lw)]);
    const rx = Math.max(p1[0], p2[0]), ry = Math.min(p1[1], p2[1]);
    cont.append(el('button', {
      class: 'vedit-del', html: I.x, title: 'Quitar', style: `left:${rx - 6}px;top:${ry - 12}px;right:auto`,
      onclick: (e) => { e.stopPropagation(); snapshot(); removeEdit(wrap, ed); },
    }));
    return cont;
  }
  function makeImageEl(wrap, ed) {
    const [vx, vy] = wrap._vp.convertToViewportPoint(ed.px, ed.py);
    const sw = ed.w * doc.scale, sh = ed.h * doc.scale;
    const box = el('div', { class: 'vedit vimage' + (ed.sign ? ' vsign' : ''), style: `left:${vx}px;top:${vy}px;width:${sw}px;height:${sh}px` });
    box.append(el('img', { src: `data:image/${ed.fmt === 'jpg' ? 'jpeg' : 'png'};base64,${ed.data}`, draggable: 'false' }));
    const handle = el('div', { class: 'vimage-handle', title: 'Ajustar tamaño' });
    const del = el('button', { class: 'vedit-del', html: I.x, title: 'Quitar', onclick: (e) => { e.stopPropagation(); snapshot(); removeEdit(wrap, ed); } });
    box.append(handle, del);
    dragBody(box, wrap, ed, '.vimage-handle, .vedit-del'); // arrastrar la imagen/firma directamente
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      snapshot();
      const sx = e.clientX, w0 = parseFloat(box.style.width), h0 = parseFloat(box.style.height), ar = w0 / h0;
      const move = (ev) => { const nw = Math.max(24, w0 + (ev.clientX - sx)); box.style.width = nw + 'px'; box.style.height = (nw / ar) + 'px'; };
      const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); ed.w = parseFloat(box.style.width) / doc.scale; ed.h = parseFloat(box.style.height) / doc.scale; };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });
    return box;
  }
  function makeNoteEl(wrap, ed) {
    const [vx, vy] = wrap._vp.convertToViewportPoint(ed.px, ed.py);
    const sw = ed.w * doc.scale, sh = ed.h * doc.scale;
    const box = el('div', { class: 'vedit vnote', style: `left:${vx}px;top:${vy}px;width:${sw}px;height:${sh}px;font-size:${13 * doc.scale}px` });
    const grip = el('div', { class: 'vnote-grip', html: I.move, title: 'Mover' });
    const del = el('button', { class: 'vedit-del', html: I.x, title: 'Quitar', onclick: (e) => { e.stopPropagation(); snapshot(); removeEdit(wrap, ed); } });
    const text = el('div', { class: 'vnote-text' });
    text.contentEditable = 'true'; text.spellcheck = false; text.textContent = ed.text || '';
    text.setAttribute('data-ph', 'Escribe tu nota…');
    text.addEventListener('input', () => { ed.text = text.innerText; });
    box.append(grip, del, text);
    dragEdit(grip, box, wrap, ed);
    return box;
  }
  function makeTextEl(wrap, ed) {
    const [vx, vy] = wrap._vp.convertToViewportPoint(ed.px, ed.py);
    const famCss = ed.family === 'times' ? 'Georgia, "Times New Roman", serif' : ed.family === 'courier' ? '"Courier New", monospace' : 'Arial, Helvetica, sans-serif';
    const box = el('div', { class: 'vedit vedit-text', style: `left:${vx}px;top:${vy}px;font-size:${ed.size * doc.scale}px;color:${colorToCss(ed.color)};font-family:${famCss};${ed.bg ? 'background:#fff;' : ''}` });
    const text = el('div', { class: 'vedit-input' });
    text.contentEditable = 'true'; text.spellcheck = false;
    text.innerHTML = ed.html != null ? ed.html : escapeHtml(ed.text || '');
    const sync = () => { ed.html = text.innerHTML; ed.text = text.innerText; };
    const fmtCmd = (cmd) => { document.execCommand('styleWithCSS', false, false); document.execCommand(cmd); sync(); text.focus(); };
    text.addEventListener('input', sync);
    text.addEventListener('keydown', (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Escape') { text.blur(); return; }
      if (ev.ctrlKey && !ev.altKey && 'biu'.includes((ev.key || '').toLowerCase())) {
        ev.preventDefault();
        fmtCmd({ b: 'bold', i: 'italic', u: 'underline' }[ev.key.toLowerCase()]);
      }
    });
    text.addEventListener('blur', () => {
      sync();
      // quitar el resaltado de selección que queda al perder el foco
      const sel = window.getSelection();
      if (sel && sel.rangeCount && sel.anchorNode && text.contains(sel.anchorNode)) sel.removeAllRanges();
      if (!text.innerText.trim()) { removeEdit(wrap, ed); return; }
      // edición in-place: revertir SOLO si ni el texto ni el formato cambiaron
      const hasFmt = /<(b|i|u|strong|em)\b|style=/i.test(text.innerHTML);
      if (ed.orig != null && ed.gid != null && text.innerText === ed.orig && !hasFmt) removeGroup(wrap, ed.gid);
    });
    // mini-barra de formato (B / I / U)
    const fmtBar = el('div', { class: 'vedit-fmt' }, [
      el('button', { class: 'vfmt vfmt-b', text: 'B', title: 'Negrita (Ctrl+B)' }),
      el('button', { class: 'vfmt vfmt-i', text: 'I', title: 'Cursiva (Ctrl+I)' }),
      el('button', { class: 'vfmt vfmt-u', text: 'U', title: 'Subrayado (Ctrl+U)' }),
    ]);
    const cmds = ['bold', 'italic', 'underline'];
    fmtBar.querySelectorAll('.vfmt').forEach((b, idx) => {
      b.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); fmtCmd(cmds[idx]); });
    });
    const grip = el('div', { class: 'vedit-grip', html: I.move, title: 'Mover' });
    const del = el('button', { class: 'vedit-del', html: I.x, title: 'Quitar', onclick: (e) => { e.stopPropagation(); snapshot(); removeEdit(wrap, ed); } });
    box.append(text, fmtBar, grip, del);
    dragEdit(grip, box, wrap, ed);
    return box;
  }
  function renderVisible() {
    const top = scrollEl.scrollTop - 300, bottom = scrollEl.scrollTop + scrollEl.clientHeight + 300;
    scrollEl.querySelectorAll('.vpage').forEach((w) => {
      if (w.offsetTop + w.offsetHeight > top && w.offsetTop < bottom) renderPage(+w.dataset.p);
    });
  }
  function relayout() {
    const anchor = doc.current;
    scrollEl.querySelectorAll('.vpage').forEach((w) => {
      const { w: pw, h: ph } = dims(+w.dataset.p);
      w.style.width = pw + 'px'; w.style.height = ph + 'px';
      w.dataset.r = '';
      w.innerHTML = `<div class="vpage-ph" style="width:${pw}px;height:${ph}px"><div class="vpage-spin"></div></div>`;
    });
    zoomLabel.textContent = Math.round(doc.scale * 100) + '%';
    goTo(anchor, true);
    renderVisible();
  }
  function setScale(s) { doc.scale = Math.min(5, Math.max(0.25, Math.round(s * 100) / 100)); relayout(); }
  // Girar SOLO una página (se incrusta al guardar)
  function rotatePage(n) {
    if (!n || n < 1 || n > doc.numPages) return;
    snapshot();
    doc.pageRot[n] = ((doc.pageRot[n] || 0) + 90) % 360;
    relayout();
    renderThumb(n);
    toast('Página ' + n + ' girada. Pulsa Guardar para conservarlo.');
  }
  function fitWidth() {
    const avail = scrollEl.clientWidth - 44;
    const maxW = Math.max(...doc.base.map((b) => (doc.rotation % 180 !== 0 ? b.h : b.w)));
    setScale(avail / maxW);
  }
  function fitPage() {
    const availH = scrollEl.clientHeight - 36, availW = scrollEl.clientWidth - 44;
    const b = doc.base[doc.current - 1];
    const pw = doc.rotation % 180 !== 0 ? b.h : b.w, ph = doc.rotation % 180 !== 0 ? b.w : b.h;
    setScale(Math.min(availW / pw, availH / ph));
  }
  function goTo(n, noClamp) {
    n = Math.min(doc.numPages, Math.max(1, n || 1));
    const wrap = scrollEl.querySelector(`.vpage[data-p="${n}"]`);
    if (wrap) scrollEl.scrollTo({ top: wrap.offsetTop - 16, behavior: noClamp ? 'auto' : 'smooth' });
    setCurrent(n);
  }
  function setCurrent(n) {
    doc.current = n;
    if (pageInput) pageInput.value = n;
    if (thumbsEl) thumbsEl.querySelectorAll('.vthumb').forEach((t) => t.classList.toggle('current', +t.dataset.t === n));
    markBookmarkBtn();
  }
  function onScroll() {
    if (scrollRAF) return;
    scrollRAF = requestAnimationFrame(() => {
      scrollRAF = null;
      const mid = scrollEl.scrollTop + scrollEl.clientHeight / 2;
      let best = 1, bestD = Infinity;
      scrollEl.querySelectorAll('.vpage').forEach((w) => {
        const c = w.offsetTop + w.offsetHeight / 2;
        const d = Math.abs(c - mid);
        if (d < bestD) { bestD = d; best = +w.dataset.p; }
      });
      if (best !== doc.current) setCurrent(best);
    });
  }
  function onWheelZoom(e) { if (!e.ctrlKey) return; e.preventDefault(); setScale(doc.scale + (e.deltaY < 0 ? 0.1 : -0.1)); }
  function toggleThumbs() {
    const show = !thumbsEl.classList.contains('show');
    thumbsEl.classList.toggle('show', show); thumbsBtn.classList.toggle('on', show);
    if (show) { outlineEl.classList.remove('show'); outlineBtn.classList.remove('on'); }
  }
  // ----- Modo lectura oscuro -----
  function applyDark() { if (viewerRoot) viewerRoot.classList.toggle('reading-dark', !!VIEWER.darkRead); if (darkBtn) darkBtn.classList.toggle('on', !!VIEWER.darkRead); }
  function toggleDark() { VIEWER.darkRead = !VIEWER.darkRead; try { localStorage.setItem('nagi_darkread', VIEWER.darkRead ? '1' : '0'); } catch (e) {} applyDark(); }
  // ----- Índice del documento + marcadores del usuario -----
  const bmKey = () => 'nagi_bm_' + (doc.path || doc.name);
  function getBookmarks() { try { return JSON.parse(localStorage.getItem(bmKey()) || '[]'); } catch (e) { return []; } }
  function saveBookmarks(l) { try { localStorage.setItem(bmKey(), JSON.stringify(l)); } catch (e) {} }
  function addBookmark(page) { const l = getBookmarks(); if (l.some((b) => b.page === page)) { toast('Esa página ya está marcada.'); return; } l.push({ page }); l.sort((a, b) => a.page - b.page); saveBookmarks(l); toast('Página ' + page + ' marcada ★'); }
  function removeBookmark(page) { saveBookmarks(getBookmarks().filter((b) => b.page !== page)); }
  function isBookmarked(page) { return getBookmarks().some((b) => b.page === page); }
  async function destToPage(dest) {
    try {
      let d = dest;
      if (typeof d === 'string') d = await doc.pdf.getDestination(d);
      if (!Array.isArray(d)) return null;
      const ref = d[0];
      if (ref && typeof ref === 'object') return (await doc.pdf.getPageIndex(ref)) + 1;
      if (typeof ref === 'number') return ref + 1;
    } catch (e) {}
    return null;
  }
  function toggleOutline() {
    const show = !outlineEl.classList.contains('show');
    outlineEl.classList.toggle('show', show); outlineBtn.classList.toggle('on', show);
    if (show) { thumbsEl.classList.remove('show'); thumbsBtn.classList.remove('on'); buildOutline(); }
  }
  async function buildOutline() {
    outlineEl.innerHTML = '';
    // --- Marcadores del usuario ---
    const bmWrap = el('div', { class: 'ol-section' });
    bmWrap.append(el('div', { class: 'ol-head' }, [
      el('span', { html: I.star + ' Marcadores' }),
      el('button', { class: 'ol-add', html: I.star + ' Marcar página', title: 'Marcar la página actual', onclick: () => { addBookmark(doc.current); buildOutline(); markBookmarkBtn(); } }),
    ]));
    const bms = getBookmarks();
    if (!bms.length) bmWrap.append(el('p', { class: 'ol-empty', text: 'Marca páginas con ★ para volver rápido a ellas.' }));
    for (const b of bms) {
      bmWrap.append(el('div', { class: 'ol-item' }, [
        el('button', { class: 'ol-link', onclick: () => goTo(b.page) }, [el('span', { class: 'ol-star', html: I.starf }), el('span', { text: b.label || ('Página ' + b.page) })]),
        el('button', { class: 'ol-del', html: I.x, title: 'Quitar', onclick: () => { removeBookmark(b.page); buildOutline(); markBookmarkBtn(); } }),
      ]));
    }
    outlineEl.append(bmWrap);
    // --- Índice del PDF (si lo tiene) ---
    let outline = null;
    try { outline = await doc.pdf.getOutline(); } catch (e) {}
    const idxWrap = el('div', { class: 'ol-section' });
    idxWrap.append(el('div', { class: 'ol-head' }, [el('span', { html: I.index + ' Índice del documento' })]));
    if (outline && outline.length) {
      const renderItems = (items, depth, container) => {
        for (const it of items) {
          container.append(el('button', {
            class: 'ol-link ol-tree', style: `padding-left:${12 + depth * 14}px`, title: it.title || '',
            onclick: async () => { const p = await destToPage(it.dest); if (p) goTo(p); else toast('No se pudo ir a esa sección.'); },
          }, [el('span', { text: it.title || '(sin título)' })]));
          if (it.items && it.items.length) renderItems(it.items, depth + 1, container);
        }
      };
      renderItems(outline, 0, idxWrap);
    } else {
      idxWrap.append(el('p', { class: 'ol-empty', text: 'Este PDF no trae índice incrustado.' }));
    }
    outlineEl.append(idxWrap);
  }
  function markBookmarkBtn() { if (bookmarkBtn) bookmarkBtn.classList.toggle('on', isBookmarked(doc.current)); }

  // ----- OCR (texto de PDFs escaneados) -----
  async function getOcrWorker() {
    if (VIEWER._ocrWorker) return VIEWER._ocrWorker;
    if (!window.Tesseract) throw new Error('El motor OCR no está disponible.');
    const base = window.nagi.tessBase;
    busy(true, 'Preparando el OCR (español + inglés)…');
    const worker = await Tesseract.createWorker(['spa', 'eng'], 1, {
      workerPath: base + '/worker.min.js',
      corePath: base + '/tesseract-core-simd-lstm.wasm.js',
      langPath: base + '/lang',
      gzip: true,
      workerBlobURL: false,
      logger: (m) => { if (m && m.status === 'recognizing text') busy(true, 'Reconociendo texto… ' + Math.round((m.progress || 0) * 100) + '%'); },
    });
    VIEWER._ocrWorker = worker;
    return worker;
  }
  // Renderiza una página a un lienzo a buena resolución para el OCR
  async function pageToCanvas(n, ocrScale) {
    const page = await doc.pdf.getPage(n);
    const vp = page.getViewport({ scale: ocrScale, rotation: (page.rotate + doc.rotation) % 360 });
    const c = document.createElement('canvas');
    c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    return { canvas: c, vp };
  }
  async function runOcr() {
    if (doc.ocrDone) { toast('Este PDF ya está reconocido — busca con Ctrl+F.'); return; }
    let worker;
    try { worker = await getOcrWorker(); } catch (e) { busy(false); toast('No se pudo iniciar el OCR: ' + (e && e.message || e), 'err'); return; }
    doc.ocr = doc.ocr || {};
    let pagesDone = 0, totalWords = 0, scanned = 0;
    try {
      for (let n = 1; n <= doc.numPages; n++) {
        let nativeLen = 0;
        try { const pg = await doc.pdf.getPage(n); const tc = await pg.getTextContent(); nativeLen = tc.items.map((i) => i.str).join('').replace(/\s/g, '').length; } catch (e) {}
        if (nativeLen > 25) continue; // la página ya tiene texto seleccionable
        scanned++;
        busy(true, `OCR página ${n}/${doc.numPages}…`);
        const { canvas, vp } = await pageToCanvas(n, 2);
        const res = await worker.recognize(canvas, {}, { blocks: true });
        const words = [];
        for (const b of (res.data.blocks || [])) for (const par of (b.paragraphs || [])) for (const ln of (par.lines || [])) for (const w of (ln.words || [])) {
          const t = (w.text || '').trim(); if (!t || (w.confidence || 0) < 35 || !w.bbox) continue;
          const p0 = vp.convertToPdfPoint(w.bbox.x0, w.bbox.y1);
          const p1 = vp.convertToPdfPoint(w.bbox.x1, w.bbox.y0);
          const x = Math.min(p0[0], p1[0]), y = Math.min(p0[1], p1[1]);
          const ww = Math.abs(p1[0] - p0[0]), hh = Math.abs(p1[1] - p0[1]);
          if (ww < 1 || hh < 1) continue;
          words.push({ text: t, x, y, w: ww, h: hh, size: hh });
        }
        doc.ocr[n] = { words };
        totalWords += words.length; pagesDone++;
      }
      busy(false);
      doc._textCache = {}; // que la búsqueda use el texto reconocido
      if (!scanned) { toast('Este PDF ya tiene texto seleccionable — no necesita OCR.'); return; }
      doc.ocrDone = true; ocrBtn.classList.add('on');
      toast(`OCR completado ✓ — ${totalWords} palabras en ${pagesDone} pág. Busca con Ctrl+F; al guardar quedará buscable en cualquier lector.`, 'ok');
    } catch (e) { busy(false); toast('Error de OCR: ' + (e && e.message || e), 'err'); }
  }
  function buildThumbs() {
    if (thumbIo) thumbIo.disconnect();
    thumbsEl.innerHTML = '';
    thumbIo = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) renderThumb(+e.target.dataset.t);
    }, { root: thumbsEl, rootMargin: '200px 0px' });
    for (let i = 1; i <= doc.numPages; i++) {
      const t = el('div', { class: 'vthumb', 'data-t': i, onclick: () => goTo(i) }, [
        el('div', { class: 'vthumb-ph' }), el('div', { class: 'vt-num', text: i }),
        el('button', { class: 'vthumb-rot', html: I.rotpage, title: 'Girar esta página', onclick: (e) => { e.stopPropagation(); rotatePage(i); } }),
      ]);
      thumbsEl.append(t);
      thumbIo.observe(t);
    }
  }
  async function renderThumb(i) {
    const t = thumbsEl.querySelector(`.vthumb[data-t="${i}"]`);
    const rkey = 'r' + (doc.pageRot[i] || 0);
    if (!t || t.dataset.r === rkey) return;
    t.dataset.r = rkey;
    const page = await doc.pdf.getPage(i);
    const rot = (page.rotate + (doc.pageRot[i] || 0)) % 360;
    const vp0 = page.getViewport({ scale: 1, rotation: rot });
    const vp = page.getViewport({ scale: 140 / vp0.width, rotation: rot });
    const canvas = el('canvas');
    canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    const ph = t.querySelector('.vthumb-ph') || t.querySelector('canvas');
    if (ph) ph.replaceWith(canvas);
  }

  // ----- barra de herramientas -----
  const vbtn = (icon, title, on) => el('button', { class: 'vbtn', title, html: icon, onclick: on });
  pageInput = el('input', { type: 'number', min: '1', value: doc.current });
  pageInput.addEventListener('change', () => goTo(+pageInput.value));
  pageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') goTo(+pageInput.value); });
  zoomLabel = el('span', { class: 'vb-zoom', text: Math.round(doc.scale * 100) + '%' });
  thumbsBtn = vbtn(I.sidebar, 'Miniaturas', toggleThumbs);
  outlineBtn = vbtn(I.index, 'Índice y marcadores', toggleOutline);
  darkBtn = vbtn(I.moon, 'Modo lectura oscuro', toggleDark);
  const ocrBtn = vbtn(I.ocr, 'OCR: reconocer texto de un PDF escaneado', () => runOcr());
  bookmarkBtn = vbtn(I.star, 'Marcar / desmarcar esta página', () => { isBookmarked(doc.current) ? removeBookmark(doc.current) : addBookmark(doc.current); markBookmarkBtn(); if (outlineEl && outlineEl.classList.contains('show')) buildOutline(); });

  // --- Herramientas de edición: Resaltar / Texto / Tapar ---
  const markBtn = vbtn(I.marker, 'Resaltar (clic=línea, arrastra=zona)', () => setTool('mark'));
  const textBtn = vbtn(I.text, 'Escribir texto (clic para colocar)', () => setTool('text'));
  const coverBtn = vbtn(I.cover, 'Tapar / corregir (arrastra un recuadro blanco)', () => setTool('cover'));
  const editBtn = vbtn(I.edittext, 'Editar texto existente (clic en una línea de texto)', () => setTool('edittext'));
  // formas + recorte
  const shapeDefs = [['rect', I.rect, 'Rectángulo'], ['ellipse', I.ellipse, 'Elipse'], ['line', I.line, 'Línea'], ['arrow', I.arrow, 'Flecha']];
  const shapeBtns = shapeDefs.map(([s, ic, ti]) => { const b = vbtn(ic, ti + ' (arrastra)', () => setTool(s)); b.dataset.shape = s; return b; });
  const snapBtn = vbtn(I.snapshot, 'Recorte "Foto" (captura una zona como imagen)', () => setTool('snapshot'));
  const imageBtn = vbtn(I.image, 'Insertar imagen', () => insertImage());
  const signBtn = vbtn(I.sign, 'Firma guardada (dibuja una vez y estámpala)', () => openSignature());
  const noteBtn = vbtn(I.note, 'Nota adhesiva (clic para colocar)', () => setTool('note'));
  const shapeColorRow = el('div', { class: 'vb-colors' });
  Object.keys(SHAPE_COLORS).forEach((k) => {
    const dot = el('button', {
      class: 'vb-color' + (VIEWER.shapeColor === k ? ' on' : ''), title: 'Color de la forma', style: `--c:${SHAPE_COLORS[k].css}`,
      onclick: () => { VIEWER.shapeColor = k; shapeColorRow.querySelectorAll('.vb-color').forEach((c) => c.classList.remove('on')); dot.classList.add('on'); },
    });
    shapeColorRow.append(dot);
  });

  // fila de colores del resaltador + "quitar todas"
  const markColorRow = el('div', { class: 'vb-colors' });
  Object.keys(MARK_COLORS).forEach((k) => {
    const dot = el('button', {
      class: 'vb-color' + (VIEWER.markColor === k ? ' on' : ''), title: 'Color del resaltador', style: `--c:${MARK_COLORS[k].css}`,
      onclick: () => { VIEWER.markColor = k; markColorRow.querySelectorAll('.vb-color').forEach((c) => c.classList.remove('on')); dot.classList.add('on'); applyCursor(); },
    });
    markColorRow.append(dot);
  });
  markColorRow.append(el('button', { class: 'vb-clear', html: I.trash + ' Quitar todas', title: 'Quitar todos los resaltados', onclick: clearMarks }));

  // fila de opciones del texto: colores + tamaño + fondo
  const textOptRow = el('div', { class: 'vb-colors' });
  Object.keys(TEXT_COLORS).forEach((k) => {
    const dot = el('button', {
      class: 'vb-color' + (VIEWER.textColor === k ? ' on' : ''), title: 'Color del texto', style: `--c:${TEXT_COLOR_CSS[k]}`,
      onclick: () => { VIEWER.textColor = k; textOptRow.querySelectorAll('.vb-color').forEach((c) => c.classList.remove('on')); dot.classList.add('on'); },
    });
    textOptRow.append(dot);
  });
  const sizeLbl = el('span', { class: 'vb-zoom', text: VIEWER.textSize });
  textOptRow.append(
    el('span', { class: 'vb-sep' }),
    vbtn(I.zoomout, 'Menos tamaño', () => { VIEWER.textSize = Math.max(6, VIEWER.textSize - 1); sizeLbl.textContent = VIEWER.textSize; }),
    sizeLbl,
    vbtn(I.zoomin, 'Más tamaño', () => { VIEWER.textSize = Math.min(96, VIEWER.textSize + 1); sizeLbl.textContent = VIEWER.textSize; }),
  );

  function clearMarks() {
    if (!doc.marks.length) { toast('No hay resaltados que quitar.'); return; }
    snapshot();
    doc.marks.length = 0;
    scrollEl.querySelectorAll('.vpage').forEach((w) => renderMarks(w));
    toast('Resaltados eliminados.');
  }
  function markerCursor() {
    const col = MARK_COLORS[VIEWER.markColor].css;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><rect x="14" y="3" width="9" height="13" rx="2.5" transform="rotate(45 18 9)" fill="${col}" stroke="#fff" stroke-width="1.5"/><path d="M8.5 19.5 L5 26 L11.5 23.5 Z" fill="${col}" stroke="#fff" stroke-width="1"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 5 26, crosshair`;
  }
  const SHAPE_TOOLS = ['rect', 'ellipse', 'line', 'arrow'];
  function applyCursor() {
    if (!scrollEl) return;
    const t = VIEWER.activeTool;
    scrollEl.style.cursor = t === 'mark' ? markerCursor()
      : ((t === 'text' || t === 'edittext') ? 'text'
        : (t === 'note' ? 'copy'
          : ((t === 'cover' || t === 'snapshot' || SHAPE_TOOLS.includes(t)) ? 'crosshair' : '')));
  }
  function setTool(name) {
    VIEWER.activeTool = (VIEWER.activeTool === name) ? '' : name;
    const t = VIEWER.activeTool;
    markBtn.classList.toggle('on', t === 'mark');
    textBtn.classList.toggle('on', t === 'text');
    coverBtn.classList.toggle('on', t === 'cover');
    editBtn.classList.toggle('on', t === 'edittext');
    snapBtn.classList.toggle('on', t === 'snapshot');
    noteBtn.classList.toggle('on', t === 'note');
    shapeBtns.forEach((b) => b.classList.toggle('on', t === b.dataset.shape));
    markColorRow.classList.toggle('show', t === 'mark');
    textOptRow.classList.toggle('show', t === 'text');
    shapeColorRow.classList.toggle('show', SHAPE_TOOLS.includes(t));
    if (viewerRoot) viewerRoot.classList.toggle('marking', t !== '');
    applyCursor();
  }
  // Guarda el resultado: si "asNew" o el doc no tiene archivo de origen → diálogo; si no → sobrescribe.
  async function outputSave(bytes, asNew) {
    busy(false);
    if (!asNew && doc.path) {
      try {
        const ok = await window.nagi.overwrite(doc.path, bytes);
        if (ok) toast('Guardado ✓ ' + doc.path.split(/[\\/]/).pop(), 'ok');
        else toast('No se pudo sobrescribir el original. Usa "Guardar como…".', 'err');
      } catch (e) { toast('Error al guardar: ' + (e && e.message || e), 'err'); }
      return;
    }
    await savePdf(bytes, doc.name.replace(/\.pdf$/i, '') + (asNew ? '-copia.pdf' : '-editado.pdf'));
  }
  async function saveDoc(asNew) {
    const hasForm = doc.formValues && Object.keys(doc.formValues).length;
    const hasOcr = doc.ocr && Object.keys(doc.ocr).some((k) => doc.ocr[k].words && doc.ocr[k].words.length);
    const hasRot = doc.pageRot && Object.values(doc.pageRot).some((v) => v % 360 !== 0);
    if (!doc.marks.length && !doc.edits.length && !hasForm && !hasOcr && !hasRot) { await outputSave(doc.bytes, asNew); return; }
    busy(true, 'Guardando…');
    try {
      const pdfDoc = await PDFDocument.load(doc.bytes, { ignoreEncryption: true });
      const ef = (n) => pdfDoc.embedFont(n);
      const fontReg = await ef(StandardFonts.Helvetica);
      // 3 familias × 4 variantes, para respetar la fuente original detectada (sans / serif / mono)
      const FONTS = {
        helv: [fontReg, await ef(StandardFonts.HelveticaBold), await ef(StandardFonts.HelveticaOblique), await ef(StandardFonts.HelveticaBoldOblique)],
        times: [await ef(StandardFonts.TimesRoman), await ef(StandardFonts.TimesRomanBold), await ef(StandardFonts.TimesRomanItalic), await ef(StandardFonts.TimesRomanBoldItalic)],
        courier: [await ef(StandardFonts.Courier), await ef(StandardFonts.CourierBold), await ef(StandardFonts.CourierOblique), await ef(StandardFonts.CourierBoldOblique)],
      };
      const pickFont = (r, fam) => { const set = FONTS[fam] || FONTS.helv; return (r.b && r.i) ? set[3] : r.b ? set[1] : r.i ? set[2] : set[0]; };
      const pages = pdfDoc.getPages();
      for (const m of doc.marks) {
        const pg = pages[m.page - 1]; if (!pg) continue;
        const [x1, y1, x2, y2] = m.rect; const c = MARK_COLORS[m.color].rgb;
        pg.drawRectangle({ x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1), color: rgb(c[0], c[1], c[2]), opacity: 0.22 });
      }
      for (const ed of doc.edits) {
        const pg = pages[ed.page - 1]; if (!pg) continue;
        if (ed.type === 'cover') {
          const [x1, y1, x2, y2] = ed.rect; const cc = ed.color || [1, 1, 1];
          pg.drawRectangle({ x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1), color: rgb(cc[0], cc[1], cc[2]) });
        } else if (ed.type === 'text') {
          const linesR = parseRuns(ed.html != null ? ed.html : escapeHtml(ed.text || ''));
          const col = colorToRgb(ed.color);
          const lh = ed.size * 1.25;
          if (ed.bg) {
            let mw = 0;
            for (const runs of linesR) { let w = 0; for (const r of runs) w += pickFont(r, ed.family).widthOfTextAtSize(r.text, ed.size); mw = Math.max(mw, w); }
            const th = lh * linesR.length;
            pg.drawRectangle({ x: ed.px - 1, y: ed.py - th, width: mw + 3, height: th, color: rgb(1, 1, 1) });
          }
          linesR.forEach((runs, li) => {
            let x = ed.px;
            const y = ed.py - ed.size * 0.82 - li * lh;
            for (const r of runs) {
              if (!r.text) continue;
              const f = pickFont(r, ed.family);
              pg.drawText(r.text, { x, y, size: ed.size, font: f, color: rgb(col[0], col[1], col[2]) });
              const w = f.widthOfTextAtSize(r.text, ed.size);
              if (r.u) pg.drawLine({ start: { x, y: y - ed.size * 0.12 }, end: { x: x + w, y: y - ed.size * 0.12 }, thickness: Math.max(0.5, ed.size * 0.06), color: rgb(col[0], col[1], col[2]) });
              x += w;
            }
          });
        } else if (ed.type === 'shape') {
          const c = (SHAPE_COLORS[ed.color] || SHAPE_COLORS.red).rgb;
          const col = rgb(c[0], c[1], c[2]);
          const lw = ed.lw || 1.5;
          const [x1, y1, x2, y2] = ed.pts;
          const minX = Math.min(x1, x2), minY = Math.min(y1, y2), W = Math.abs(x2 - x1), H = Math.abs(y2 - y1);
          if (ed.shape === 'rect') pg.drawRectangle({ x: minX, y: minY, width: W, height: H, borderColor: col, borderWidth: lw });
          else if (ed.shape === 'ellipse') pg.drawEllipse({ x: minX + W / 2, y: minY + H / 2, xScale: W / 2, yScale: H / 2, borderColor: col, borderWidth: lw });
          else {
            pg.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: lw, color: col });
            if (ed.shape === 'arrow') {
              const ang = Math.atan2(y2 - y1, x2 - x1), ah = Math.max(6, lw * 3.4);
              pg.drawLine({ start: { x: x2, y: y2 }, end: { x: x2 - ah * Math.cos(ang - Math.PI / 6), y: y2 - ah * Math.sin(ang - Math.PI / 6) }, thickness: lw, color: col });
              pg.drawLine({ start: { x: x2, y: y2 }, end: { x: x2 - ah * Math.cos(ang + Math.PI / 6), y: y2 - ah * Math.sin(ang + Math.PI / 6) }, thickness: lw, color: col });
            }
          }
        } else if (ed.type === 'image') {
          try {
            const ib = dataUrlToBytes(`data:image/${ed.fmt === 'jpg' ? 'jpeg' : 'png'};base64,${ed.data}`);
            const img = ed.fmt === 'jpg' ? await pdfDoc.embedJpg(ib) : await pdfDoc.embedPng(ib);
            pg.drawImage(img, { x: ed.px, y: ed.py - ed.h, width: ed.w, height: ed.h });
          } catch (e) {}
        } else if (ed.type === 'note') {
          const nw = ed.w, nh = ed.h, fs = 11, lh = fs * 1.22, pad = 7;
          pg.drawRectangle({ x: ed.px, y: ed.py - nh, width: nw, height: nh, color: rgb(1, 0.9, 0.36) });
          pg.drawRectangle({ x: ed.px, y: ed.py - nh, width: nw, height: nh, borderColor: rgb(0.85, 0.7, 0.15), borderWidth: 0.8 });
          // ajustar el texto al ancho de la nota
          const maxW = nw - pad * 2, lines = [];
          for (const para of (ed.text || '').split('\n')) {
            let line = '';
            for (const word of para.split(' ')) {
              const test = line ? line + ' ' + word : word;
              if (fontReg.widthOfTextAtSize(test, fs) > maxW && line) { lines.push(line); line = word; } else line = test;
            }
            lines.push(line);
          }
          lines.forEach((ln, li) => {
            const y = ed.py - pad - fs - li * lh;
            if (y > ed.py - nh + 2) pg.drawText(ln, { x: ed.px + pad, y, size: fs, font: fontReg, color: rgb(0.18, 0.13, 0.02) });
          });
        }
      }
      // valores de formulario
      if (hasForm) {
        try {
          const form = pdfDoc.getForm();
          for (const [nm, val] of Object.entries(doc.formValues)) {
            try { form.getTextField(nm).setText(val == null ? '' : String(val)); continue; } catch (e) {}
            try { const cb = form.getCheckBox(nm); (val && val !== 'Off') ? cb.check() : cb.uncheck(); continue; } catch (e) {}
            try { form.getRadioGroup(nm).select(val); continue; } catch (e) {}
            try { form.getDropdown(nm).select(val); continue; } catch (e) {}
            try { form.getOptionList(nm).select(val); continue; } catch (e) {}
          }
          try { form.updateFieldAppearances(fontReg); } catch (e) {}
        } catch (e) {}
      }
      // capa de texto INVISIBLE del OCR (hace el escaneo buscable en cualquier lector)
      if (hasOcr) {
        for (const [pStr, data] of Object.entries(doc.ocr)) {
          const pg = pages[(+pStr) - 1]; if (!pg || !data.words) continue;
          for (const w of data.words) {
            try { pg.drawText(w.text, { x: w.x, y: w.y, size: Math.max(4, w.size * 0.86), font: fontReg, color: rgb(0, 0, 0), opacity: 0 }); } catch (e) {}
          }
        }
      }
      // rotación incrustada SOLO en las páginas giradas
      if (hasRot) {
        for (const [pStr, deg] of Object.entries(doc.pageRot)) {
          const pg = pages[(+pStr) - 1]; if (!pg || !(deg % 360)) continue;
          pg.setRotation(degrees((pg.getRotation().angle + deg) % 360));
        }
      }
      const bytes = await pdfDoc.save();
      await outputSave(bytes, asNew);
    } catch (e) { busy(false); toast('Error al guardar: ' + e.message, 'err'); }
  }

  // ---- Buscar (Ctrl+F) ----
  let searchInput, searchCount;
  const searchBar = el('div', { class: 'viewer-search', hidden: '' }, [
    el('span', { class: 'vs-ico', html: I.search }),
    (searchInput = el('input', { type: 'text', placeholder: 'Buscar en el documento…' })),
    (searchCount = el('span', { class: 'vs-count', text: '' })),
    el('button', { class: 'vbtn', html: I.up, title: 'Anterior (Mayús+Intro)', onclick: () => prevHit() }),
    el('button', { class: 'vbtn', html: I.down, title: 'Siguiente (Intro)', onclick: () => nextHit() }),
    el('button', { class: 'vbtn', html: I.x, title: 'Cerrar (Esc)', onclick: () => closeSearch() }),
  ]);
  let searchTimer = null;
  searchInput.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => runSearch(searchInput.value), 220); });
  searchInput.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') { e.preventDefault(); e.shiftKey ? prevHit() : nextHit(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeSearch(); }
  });
  function openSearch() { searchBar.hidden = false; searchInput.focus(); searchInput.select(); }
  function closeSearch() {
    searchBar.hidden = true;
    if (doc.search) { doc.search = { query: '', hits: [], active: -1 }; renderAllPages(); }
    if (scrollEl) scrollEl.focus();
  }
  function renderAllPages() { if (scrollEl) scrollEl.querySelectorAll('.vpage').forEach((w) => renderMarks(w)); }
  function updateSearchCount() {
    const s = doc.search;
    searchCount.textContent = (!s || !s.query) ? '' : (s.hits.length ? `${s.active + 1}/${s.hits.length}` : 'Sin resultados');
  }
  async function runSearch(query) {
    query = (query || '').trim();
    doc.search = { query, hits: [], active: -1 };
    if (!query) { searchCount.textContent = ''; renderAllPages(); return; }
    searchCount.textContent = '…';
    const q = query.toLowerCase();
    for (let n = 1; n <= doc.numPages; n++) {
      const { text, items } = await getPageText(doc, n);
      const low = text.toLowerCase();
      let idx = low.indexOf(q);
      while (idx !== -1) {
        const mEnd = idx + q.length, rects = [];
        for (const it of items) {
          if (it.end > idx && it.start < mEnd && it.str.length) {
            const fs = Math.hypot(it.tr[2], it.tr[3]) || 10;
            const len = it.str.length || 1;
            const a = (Math.max(idx, it.start) - it.start) / len;
            const b = (Math.min(mEnd, it.end) - it.start) / len;
            rects.push([it.tr[4] + a * it.width, it.tr[5] - fs * 0.25, it.tr[4] + b * it.width, it.tr[5] + fs * 0.85]);
          }
        }
        if (rects.length) doc.search.hits.push({ page: n, rects });
        idx = low.indexOf(q, idx + Math.max(1, q.length));
      }
    }
    doc.search.active = doc.search.hits.length ? 0 : -1;
    renderAllPages();
    updateSearchCount();
    if (doc.search.active >= 0) gotoHit(0);
  }
  function gotoHit(i) {
    const s = doc.search; if (!s || !s.hits.length) return;
    s.active = ((i % s.hits.length) + s.hits.length) % s.hits.length;
    const hit = s.hits[s.active];
    setCurrent(hit.page);
    updateSearchCount();
    const center = (w) => { const v = w._vp.convertToViewportRectangle(hit.rects[0]); scrollEl.scrollTo({ top: Math.max(0, w.offsetTop + Math.min(v[1], v[3]) - scrollEl.clientHeight / 2), behavior: 'smooth' }); };
    const wrap = scrollEl.querySelector(`.vpage[data-p="${hit.page}"]`);
    if (wrap && wrap._vp && hit.rects[0]) { center(wrap); renderAllPages(); }
    else { goTo(hit.page, true); setTimeout(() => { renderAllPages(); const w2 = scrollEl.querySelector(`.vpage[data-p="${hit.page}"]`); if (w2 && w2._vp && hit.rects[0]) center(w2); }, 280); }
  }
  function nextHit() { if (doc.search && doc.search.hits.length) gotoHit(doc.search.active + 1); }
  function prevHit() { if (doc.search && doc.search.hits.length) gotoHit(doc.search.active - 1); }

  // ---- Atajos de teclado del visor ----
  VIEWER.viewerKeys = (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); openSearch(); return; }
    if (mod && (e.key === 's' || e.key === 'S')) { e.preventDefault(); saveDoc(e.shiftKey); return; }
    if (mod && (e.key === 'p' || e.key === 'P')) { e.preventDefault(); openPrintPreview({ pdf: doc.pdf, bytes: doc.bytes, numPages: doc.numPages, current: doc.current }); return; }
    if (mod && (e.key === 'o' || e.key === 'O')) { e.preventDefault(); viewerPick(); return; }
    if (mod && e.key === 'ArrowRight') { e.preventDefault(); goTo(doc.current + 1); return; }
    if (mod && e.key === 'ArrowLeft') { e.preventDefault(); goTo(doc.current - 1); return; }
  };

  const bar = el('div', { class: 'viewer-bar' }, [
    vbtn(I.save, doc.path ? 'Guardar (sobrescribe el original) · Ctrl+S' : 'Guardar · Ctrl+S', () => saveDoc(false)),
    vbtn(I.saveas, 'Guardar como… (copia nueva) · Ctrl+Mayús+S', () => saveDoc(true)),
    vbtn(I.print, 'Imprimir', () => openPrintPreview({ pdf: doc.pdf, bytes: doc.bytes, numPages: doc.numPages, current: doc.current })),
    vbtn(I.search, 'Buscar (Ctrl+F)', () => openSearch()),
    el('span', { class: 'vb-sep' }),
    thumbsBtn, outlineBtn, bookmarkBtn, darkBtn, ocrBtn,
    el('span', { class: 'vb-sep' }),
    vbtn(I.up, 'Página anterior', () => goTo(doc.current - 1)),
    el('div', { class: 'vb-page' }, [pageInput, el('span', { text: '/ ' + doc.numPages })]),
    vbtn(I.down, 'Página siguiente', () => goTo(doc.current + 1)),
    el('span', { class: 'vb-sep' }),
    vbtn(I.zoomout, 'Alejar', () => setScale(doc.scale - 0.15)),
    zoomLabel,
    vbtn(I.zoomin, 'Acercar', () => setScale(doc.scale + 0.15)),
    vbtn(I.fitwidth, 'Ajustar al ancho', fitWidth),
    vbtn(I.fitpage, 'Ajustar a la página', fitPage),
    vbtn(I.rotpage, 'Girar SOLO esta página (se guarda)', () => rotatePage(doc.current)),
    vbtn(I.rot, 'Girar la vista (todas, sin guardar)', () => { doc.rotation = (doc.rotation + 90) % 360; relayout(); }),
    el('span', { class: 'vb-sep' }),
    markBtn, coverBtn, textBtn, editBtn,
    el('span', { class: 'vb-sep' }),
    ...shapeBtns, snapBtn,
    el('span', { class: 'vb-sep' }),
    imageBtn, signBtn, noteBtn,
    markColorRow, textOptRow, shapeColorRow,
    el('span', { class: 'vb-spacer' }),
    vbtn(I.merge, 'Combinar con otros PDF', () => openTool('merge', [{ name: doc.name, bytes: doc.bytes }])),
    el('button', { class: 'btn btn-ghost', html: I.organize + ' Organizar', onclick: () => openTool('organize', [{ name: doc.name, bytes: doc.bytes }]) }),
  ]);

  thumbsEl = el('div', { class: 'viewer-thumbs' });
  outlineEl = el('div', { class: 'viewer-outline' });
  scrollEl = el('div', { class: 'viewer-scroll' });
  viewerRoot = el('div', { class: 'viewer' + (VIEWER.activeTool ? ' marking' : '') }, [tabbar, bar, searchBar, el('div', { class: 'viewer-body' }, [thumbsEl, outlineEl, scrollEl])]);
  applyDark();
  ws.append(viewerRoot);

  buildPages();
  buildThumbs();
  scrollEl.addEventListener('scroll', onScroll);
  scrollEl.addEventListener('wheel', onWheelZoom, { passive: false });

  function placeText(wrap, x0, y0) {
    const p = wrap._vp.convertToPdfPoint(x0, y0);
    const ed = { type: 'text', page: +wrap.dataset.p, px: p[0], py: p[1], size: VIEWER.textSize, color: VIEWER.textColor, bg: true, text: '', html: '' };
    snapshot();
    doc.edits.push(ed);
    const node = makeTextEl(wrap, ed);
    wrap.querySelector('.vmark-layer').append(node);
    requestAnimationFrame(() => { const inp = node.querySelector('.vedit-input'); if (inp) inp.focus(); });
  }

  // --- Nota adhesiva (post-it) ---
  function placeNote(wrap, x0, y0) {
    const p = wrap._vp.convertToPdfPoint(x0, y0);
    const ed = { type: 'note', page: +wrap.dataset.p, px: p[0], py: p[1], w: 150, h: 96, text: '' };
    snapshot();
    doc.edits.push(ed);
    const node = makeNoteEl(wrap, ed);
    wrap.querySelector('.vmark-layer').append(node);
    setTool('note'); // desactivar para no colocar otra al instante
    requestAnimationFrame(() => { const t = node.querySelector('.vnote-text'); if (t) t.focus(); });
  }

  // --- Insertar imagen desde un archivo ---
  async function insertImage() {
    let files;
    try { files = await window.nagi.openImages(); } catch (e) { return; }
    if (!files || !files.length) return;
    const f = files[0];
    const bytes = new Uint8Array(f.data);
    let fmt = /\.png$/i.test(f.name) ? 'png' : (/\.jpe?g$/i.test(f.name) ? 'jpg' : null);
    let b64;
    if (fmt) { b64 = bytesToB64(bytes); }
    else {
      // convertir webp/gif/bmp a PNG
      try {
        const im = await loadBytesImg(bytes);
        const c = el('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
        c.getContext('2d').drawImage(im, 0, 0);
        b64 = c.toDataURL('image/png').split(',')[1]; fmt = 'png';
      } catch (e) { toast('No se pudo leer la imagen.', 'err'); return; }
    }
    let im;
    try { im = await loadImg(`data:image/${fmt === 'jpg' ? 'jpeg' : 'png'};base64,${b64}`); } catch (e) { toast('Imagen no válida.', 'err'); return; }
    placeStamp(b64, fmt, im.naturalWidth / im.naturalHeight, 0.42);
  }

  // coloca una imagen (o firma) centrada en la página actual
  function placeStamp(b64, fmt, ar, widthFrac) {
    const base = doc.base[doc.current - 1]; if (!base) return;
    const wPdf = base.w * widthFrac;
    const hPdf = wPdf / (ar || 2);
    const ed = { type: 'image', page: doc.current, px: (base.w - wPdf) / 2, py: (base.h + hPdf) / 2, w: wPdf, h: hPdf, fmt, data: b64 };
    snapshot();
    doc.edits.push(ed);
    const wrap = scrollEl.querySelector(`.vpage[data-p="${doc.current}"]`);
    if (wrap) { renderMarks(wrap); wrap.scrollIntoView({ block: 'nearest' }); }
    toast('Imagen colocada — arrástrala o ajústala con la esquina.');
  }

  // --- Firma guardada (QuickSign): dibuja una vez, se guarda y se estampa ---
  function openSignature() {
    const saved = localStorage.getItem('nagi_sig');
    const pad = el('canvas', { class: 'sign-pad', width: 600, height: 220 });
    const ctx = pad.getContext('2d');
    ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#15324a';
    // override = una firma ya lista (escaneada/guardada) con su proporción; null = vale lo dibujado a mano
    let override = null;
    const pos = (e) => { const r = pad.getBoundingClientRect(); return [(e.clientX - r.left) * pad.width / r.width, (e.clientY - r.top) * pad.height / r.height]; };
    let drawing = false, last = null;
    pad.addEventListener('pointerdown', (e) => { override = null; drawing = true; last = pos(e); pad.setPointerCapture(e.pointerId); });
    pad.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p; });
    pad.addEventListener('pointerup', () => { drawing = false; });
    const hint = el('p', { class: 'sign-hint', text: saved ? 'Esta es tu firma guardada. Dibuja una nueva, o sube otra escaneada.' : 'Dibuja tu firma con el ratón, o sube una foto/escaneo y la limpio.' });
    // dibuja una firma lista (transparente) centrada y proporcional sobre el lienzo blanco
    const previewOnPad = (im) => {
      ctx.clearRect(0, 0, pad.width, pad.height);
      const ar = im.naturalWidth / im.naturalHeight;
      let dw = pad.width * 0.92, dh = dw / ar;
      if (dh > pad.height * 0.88) { dh = pad.height * 0.88; dw = dh * ar; }
      ctx.drawImage(im, (pad.width - dw) / 2, (pad.height - dh) / 2, dw, dh);
    };
    const setReady = (dataUrl) => loadImg(dataUrl).then((im) => { override = { dataUrl, ar: im.naturalWidth / im.naturalHeight }; previewOnPad(im); }).catch(() => {});
    if (saved) setReady(saved);
    const clear = () => { ctx.clearRect(0, 0, pad.width, pad.height); override = null; };
    const uploadScan = async () => {
      let files; try { files = await window.nagi.openImages(); } catch (e) { return; }
      if (!files || !files.length) return;
      let im; try { im = await loadBytesImg(new Uint8Array(files[0].data)); } catch (e) { toast('No se pudo leer la imagen.', 'err'); return; }
      busy(true, 'Procesando la firma…');
      try { const res = processScan(im); override = res; await loadImg(res.dataUrl).then(previewOnPad); toast('Firma limpiada: fondo quitado y trazo reforzado.'); }
      catch (e) { toast('No se pudo procesar la firma.', 'err'); }
      busy(false);
    };
    const overlay = el('div', { class: 'pp-overlay' });
    const close = () => overlay.remove();
    const useSign = () => {
      const du = override ? override.dataUrl : pad.toDataURL('image/png');
      const ar = override ? override.ar : pad.width / pad.height;
      try { localStorage.setItem('nagi_sig', du); } catch (e) {}
      placeStamp(du.split(',')[1], 'png', ar, 0.3);
      close();
    };
    overlay.append(el('div', { class: 'pp-frame sign-frame' }, [
      el('div', { class: 'pp-head' }, [
        el('div', { class: 'pp-ico', html: I.sign }),
        el('h3', { text: 'Tu firma' }),
        el('button', { class: 'vbtn pp-x', html: I.x, title: 'Cerrar', onclick: close }),
      ]),
      el('div', { class: 'sign-body' }, [
        hint,
        el('div', { class: 'sign-pad-wrap' }, [pad]),
      ]),
      el('div', { class: 'pp-foot' }, [
        el('button', { class: 'btn btn-ghost', html: I.image + ' Subir escaneada', title: 'Sube una foto o escaneo de tu firma en papel', onclick: uploadScan }),
        el('button', { class: 'btn btn-ghost', html: I.trash + ' Borrar', onclick: clear }),
        el('div', { class: 'pp-actions' }, [
          el('button', { class: 'btn btn-ghost', text: 'Cancelar', onclick: close }),
          el('button', { class: 'btn btn-primary', html: I.sign + ' Firmar', onclick: useSign }),
        ]),
      ]),
    ]));
    document.body.append(overlay);
  }

  // --- muestreo de color sobre el lienzo (para detectar tinta y fondo) ---
  function samplePixel(canvas, pt) {
    try {
      const x = Math.max(0, Math.min(canvas.width - 1, Math.round(pt[0])));
      const y = Math.max(0, Math.min(canvas.height - 1, Math.round(pt[1])));
      const d = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    } catch (e) { return null; }
  }
  function sampleInk(canvas, tl, br) {
    try {
      const x0 = Math.max(0, Math.round(Math.min(tl[0], br[0]))), y0 = Math.max(0, Math.round(Math.min(tl[1], br[1])));
      const x1 = Math.min(canvas.width, Math.round(Math.max(tl[0], br[0]))), y1 = Math.min(canvas.height, Math.round(Math.max(tl[1], br[1])));
      const w = Math.max(1, x1 - x0), h = Math.max(1, y1 - y0);
      const d = canvas.getContext('2d').getImageData(x0, y0, w, h).data;
      let best = null, bestLum = 999;
      for (let i = 0; i < d.length; i += 4) {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        if (lum < bestLum) { bestLum = lum; best = [d[i] / 255, d[i + 1] / 255, d[i + 2] / 255]; }
      }
      return best;
    } catch (e) { return null; }
  }
  function sampleBg(canvas, vp, minX, maxX, topY, botY, fs) {
    const pts = [
      vp.convertToViewportPoint(minX, topY + fs * 0.35),
      vp.convertToViewportPoint(maxX, botY - fs * 0.35),
      vp.convertToViewportPoint(minX - fs * 0.5, (topY + botY) / 2),
      vp.convertToViewportPoint(maxX + fs * 0.5, (topY + botY) / 2),
    ];
    let best = [1, 1, 1], bestLum = -1;
    for (const p of pts) {
      const c = samplePixel(canvas, p); if (!c) continue;
      const lum = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
      if (lum > bestLum) { bestLum = lum; best = c; }
    }
    return best;
  }

  // --- Fase 2: editar el texto YA EXISTENTE bajo el clic ---
  // Detecta la fuente original de un fragmento (familia sans/serif/mono + negrita/cursiva)
  // a partir del nombre real de la fuente incrustada en el PDF.
  function fontStyleOf(page, content, item) {
    let name = '';
    try { const f = page.commonObjs.get(item.fontName); if (f) name = f.name || f.fallbackName || ''; } catch (e) {}
    if (!name && content.styles && content.styles[item.fontName]) name = content.styles[item.fontName].fontFamily || '';
    const n = (name || '').toLowerCase();
    const bold = /bold|black|heavy|semibold|demibold|,\s*bold|-md\b|\bmedium\b/.test(n);
    const italic = /italic|oblique/.test(n);
    const family = /courier|mono|consol|menlo|typewriter/.test(n) ? 'courier'
      : /times|georgia|roman|minion|garamond|serif|antiqua|cambria|palatino/.test(n) ? 'times' : 'helv';
    return { name, bold, italic, family };
  }
  async function editTextAt(wrap, x0, y0) {
    const pageNum = +wrap.dataset.p;
    let content, page;
    try {
      page = await doc.pdf.getPage(pageNum);
      content = await page.getTextContent();
    } catch (e) { toast('No se pudo leer el texto del PDF.', 'err'); return; }
    const vp = wrap._vp;
    const [cpx, cpy] = vp.convertToPdfPoint(x0, y0);
    const items = content.items.filter((it) => it.str && it.str.trim());
    let hit = null;
    for (const it of items) {
      const tr = it.transform; const fs = Math.hypot(tr[2], tr[3]) || Math.abs(tr[3]) || 10;
      if (cpx >= tr[4] - 2 && cpx <= tr[4] + it.width + 2 && cpy >= tr[5] - fs * 0.3 && cpy <= tr[5] + fs * 0.9) { hit = it; break; }
    }
    if (!hit) { toast('No hay texto editable aquí. ¿Es un PDF escaneado?', 'warn'); return; }
    const hfs = Math.hypot(hit.transform[2], hit.transform[3]) || Math.abs(hit.transform[3]) || 12;
    const baseY = hit.transform[5];
    const line = items.filter((it) => {
      const fs = Math.hypot(it.transform[2], it.transform[3]) || 12;
      return Math.abs(it.transform[5] - baseY) <= Math.max(hfs, fs) * 0.4;
    }).sort((a, b) => a.transform[4] - b.transform[4]);
    const text = line.map((it) => it.str).join('');
    const minX = Math.min(...line.map((it) => it.transform[4]));
    const maxX = Math.max(...line.map((it) => it.transform[4] + it.width));
    const topY = baseY + hfs * 0.82, botY = baseY - hfs * 0.28;
    const canvas = wrap.querySelector('canvas');
    const tl = vp.convertToViewportPoint(minX, topY), br = vp.convertToViewportPoint(maxX, botY);
    const ink = (canvas && sampleInk(canvas, tl, br)) || [0.1, 0.1, 0.1];
    const bg = (canvas && sampleBg(canvas, vp, minX, maxX, topY, botY, hfs)) || [1, 1, 1];
    const fst = fontStyleOf(page, content, hit);
    let html = escapeHtml(text);
    if (fst.italic) html = '<i>' + html + '</i>';
    if (fst.bold) html = '<b>' + html + '</b>';
    const gid = (VIEWER.gid = (VIEWER.gid || 0) + 1);
    snapshot();
    doc.edits.push({ type: 'cover', page: pageNum, rect: [minX - 1, botY - 1, maxX + 1, topY + 1], color: bg, gid });
    const ed = { type: 'text', page: pageNum, px: minX, py: topY, size: Math.max(6, Math.round(hfs)), color: ink, bg: false, text, html, orig: text, family: fst.family, gid };
    doc.edits.push(ed);
    if (fst.name) toast('Fuente detectada: ' + fst.name.replace(/^[A-Z]{6}\+/, '') + (fst.bold ? ' · negrita' : '') + (fst.italic ? ' · cursiva' : ''));
    renderMarks(wrap);
    requestAnimationFrame(() => {
      const layer = wrap.querySelector('.vmark-layer');
      const inputs = layer ? layer.querySelectorAll('.vedit-text .vedit-input') : [];
      const inp = inputs[inputs.length - 1];
      if (inp) { inp.focus(); const s = document.getSelection(); s.selectAllChildren(inp); }
    });
  }

  // --- crear marcas / tapados / texto sobre la página ---
  let drawing = null;
  scrollEl.addEventListener('pointerdown', (e) => {
    const t = VIEWER.activeTool;
    if (!t || e.button !== 0 || e.target.closest('.vmark-del, .vedit, .vform-field')) return;
    const wrap = e.target.closest('.vpage');
    if (!wrap || !wrap._vp) return;
    // confirmar (cerrar) cualquier cuadro de texto que estuviera editándose
    const ai = document.activeElement;
    if (ai && ai.classList && ai.classList.contains('vedit-input')) ai.blur();
    const layer = wrap.querySelector('.vmark-layer'); if (!layer) return;
    const r = wrap.getBoundingClientRect();
    const x0 = e.clientX - r.left, y0 = e.clientY - r.top;
    if (t === 'text') { placeText(wrap, x0, y0); e.preventDefault(); return; }
    if (t === 'note') { placeNote(wrap, x0, y0); e.preventDefault(); return; }
    if (t === 'edittext') { editTextAt(wrap, x0, y0); e.preventDefault(); return; }
    if (SHAPE_TOOLS.includes(t)) { drawing = { wrap, x0, y0, tool: t, isShape: true, layer, prev: null }; e.preventDefault(); return; }
    if (t === 'snapshot') {
      const sel = el('div', { class: 'vsnap-sel', style: `left:${x0}px;top:${y0}px;width:0;height:0` });
      layer.append(sel);
      drawing = { wrap, div: sel, x0, y0, tool: 'snapshot' };
      e.preventDefault(); return;
    }
    const cls = t === 'cover' ? 'vedit-drawing' : 'vmark-drawing';
    const colorCss = t === 'cover' ? '#ffffff' : MARK_COLORS[VIEWER.markColor].css;
    const div = el('div', { class: cls, style: `left:${x0}px;top:${y0}px;width:0;height:0;--mc:${colorCss}` });
    layer.append(div);
    drawing = { wrap, div, x0, y0, tool: t };
    e.preventDefault();
  });
  scrollEl.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const r = drawing.wrap.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, e.clientX - r.left));
    const y = Math.max(0, Math.min(r.height, e.clientY - r.top));
    if (drawing.isShape) {
      if (drawing.prev) drawing.prev.remove();
      drawing.cur = { x, y };
      drawing.prev = shapeSvg(drawing.tool, drawing.x0, drawing.y0, x, y, SHAPE_COLORS[VIEWER.shapeColor].css, 2.5);
      drawing.layer.append(drawing.prev);
      return;
    }
    Object.assign(drawing.div.style, {
      left: Math.min(x, drawing.x0) + 'px', top: Math.min(y, drawing.y0) + 'px',
      width: Math.abs(x - drawing.x0) + 'px', height: Math.abs(y - drawing.y0) + 'px',
    });
  });
  function pushRectMark(wrap, left, top, w, h) {
    snapshot();
    const p1 = wrap._vp.convertToPdfPoint(left, top);
    const p2 = wrap._vp.convertToPdfPoint(left + w, top + h);
    doc.marks.push({ page: +wrap.dataset.p, color: VIEWER.markColor, rect: [p1[0], p1[1], p2[0], p2[1]] });
    renderMarks(wrap);
  }
  // Detecta SOLO la línea pulsada: busca el pico de tinta del clic y se detiene
  // en los huecos (valles) de encima y debajo. Así marca una fila, no varias.
  function detectLineBand(canvas, yc) {
    const W = canvas.width, H = canvas.height;
    const reach = Math.max(10, Math.round(H * 0.035));
    const y0 = Math.max(0, Math.round(yc) - reach), y1 = Math.min(H, Math.round(yc) + reach);
    let data;
    try { data = canvas.getContext('2d').getImageData(0, y0, W, y1 - y0).data; } catch (e) { return null; }
    const rows = y1 - y0;
    const ink = new Array(rows).fill(0);
    for (let r = 0; r < rows; r++) {
      let d = 0; const base = r * W * 4;
      for (let i = 0; i < W; i += 2) {
        const p = base + i * 4;
        if (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2] < 150) d++;
      }
      ink[r] = d;
    }
    // pico de tinta cerca del clic (la línea que se ha pulsado)
    const cr = Math.round(yc) - y0;
    let peak = Math.max(0, Math.min(rows - 1, cr));
    const span = Math.round(H * 0.008);
    for (let d = 0; d <= span; d++) {
      if (cr - d >= 0 && ink[cr - d] > ink[peak]) peak = cr - d;
      if (cr + d < rows && ink[cr + d] > ink[peak]) peak = cr + d;
    }
    if (ink[peak] < Math.max(2, W * 0.002)) return null; // clic en zona vacía
    const thr = Math.max(1, ink[peak] * 0.22); // umbral relativo: el hueco entre líneas cae por debajo
    let top = peak, bot = peak;
    while (top > 0 && ink[top - 1] > thr) top--;
    while (bot < rows - 1 && ink[bot + 1] > thr) bot++;
    const pad = Math.max(1, Math.round((bot - top) * 0.3));
    return { top: y0 + Math.max(0, top - pad), bot: y0 + Math.min(rows - 1, bot + pad) };
  }
  // Clic → resaltar la línea entera (ancho completo, alto detectado).
  function markLine(wrap, clickY) {
    const canvas = wrap.querySelector('canvas');
    if (!canvas || !wrap._vp) return;
    const W = canvas.width, H = canvas.height;
    const band = detectLineBand(canvas, clickY);
    let top, bot;
    if (band) { top = Math.max(0, band.top - 3); bot = Math.min(H, band.bot + 3); }
    else { const hh = H * 0.016; top = clickY - hh; bot = clickY + hh; }
    const margin = W * 0.03;
    pushRectMark(wrap, margin, top, W - margin * 2, bot - top);
  }
  async function captureSnapshot(wrap, left, top, w, h) {
    const canvas = wrap.querySelector('canvas'); if (!canvas) return;
    const W = Math.round(w), H = Math.round(h);
    const c2 = el('canvas'); c2.width = W; c2.height = H;
    c2.getContext('2d').drawImage(canvas, Math.round(left), Math.round(top), W, H, 0, 0, W, H);
    const bytes = dataUrlToBytes(c2.toDataURL('image/png'));
    const path = await window.nagi.save(doc.name.replace(/\.pdf$/i, '') + '-recorte.png', bytes, [{ name: 'Imagen PNG', extensions: ['png'] }]);
    if (path) toast('Recorte guardado: ' + path.split(/[\\/]/).pop());
  }
  function endDraw() {
    if (!drawing) return;
    const d = drawing; drawing = null;
    const { wrap, tool, x0, y0 } = d;
    if (!wrap._vp) { if (d.div) d.div.remove(); if (d.prev) d.prev.remove(); return; }
    if (d.isShape) {
      if (d.prev) d.prev.remove();
      if (!d.cur) return;
      const dw = Math.abs(d.cur.x - x0), dh = Math.abs(d.cur.y - y0);
      if (dw < 4 && dh < 4) return;
      snapshot();
      const p1 = wrap._vp.convertToPdfPoint(x0, y0);
      const p2 = wrap._vp.convertToPdfPoint(d.cur.x, d.cur.y);
      doc.edits.push({ type: 'shape', shape: tool, page: +wrap.dataset.p, pts: [p1[0], p1[1], p2[0], p2[1]], color: VIEWER.shapeColor, lw: 2.5 / doc.scale });
      renderMarks(wrap);
      return;
    }
    const div = d.div;
    const left = parseFloat(div.style.left), top = parseFloat(div.style.top);
    const w = parseFloat(div.style.width), h = parseFloat(div.style.height);
    div.remove();
    if (tool === 'snapshot') { if (w >= 6 && h >= 6) captureSnapshot(wrap, left, top, w, h); return; }
    if (tool === 'cover') {
      if (w < 6 || h < 6) return;
      snapshot();
      const canvas = wrap.querySelector('canvas');
      let bg = [1, 1, 1];
      if (canvas) {
        const pts = [[left + w / 2, top - 4], [left + w / 2, top + h + 4], [left - 4, top + h / 2], [left + w + 4, top + h / 2]];
        let bestLum = -1;
        for (const p of pts) { const c = samplePixel(canvas, p); if (!c) continue; const lum = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]; if (lum > bestLum) { bestLum = lum; bg = c; } }
      }
      const p1 = wrap._vp.convertToPdfPoint(left, top);
      const p2 = wrap._vp.convertToPdfPoint(left + w, top + h);
      doc.edits.push({ type: 'cover', page: +wrap.dataset.p, rect: [p1[0], p1[1], p2[0], p2[1]], color: bg });
      renderMarks(wrap);
      return;
    }
    if (w < 6 && h < 6) { markLine(wrap, y0); return; } // clic simple → línea entera
    if (w < 6 || h < 6) return;
    pushRectMark(wrap, left, top, w, h); // arrastre → rectángulo libre
  }
  scrollEl.addEventListener('pointerup', endDraw);
  scrollEl.addEventListener('pointerleave', endDraw);
  applyCursor();

  if (firstTime) requestAnimationFrame(fitWidth);
  else { goTo(doc.current, true); renderVisible(); }
}

/* ---------- 1. UNIR ---------- */
function toolMerge(tool, initialFiles) {
  const body = toolFrame(tool);
  let files = [];
  const listWrap = el('div', {});
  const dz = dropzone(body, {
    accept: 'pdf', multiple: true,
    label: 'Arrastra aquí tus PDF', sub: 'O haz clic para elegirlos. Puedes añadir más después.',
    onfiles: (fs) => { files = files.concat(fs); render(); },
  });
  body.append(listWrap);
  if (initialFiles && initialFiles.length) { files = files.concat(initialFiles); render(); }

  function render() {
    listWrap.innerHTML = '';
    if (!files.length) return;
    const list = el('div', { class: 'filelist' });
    files.forEach((f, i) => {
      list.append(el('div', { class: 'file-row' }, [
        el('span', { class: 'fr-num', text: i + 1 }),
        el('span', { class: 'fr-name', text: f.name }),
        el('span', { class: 'fr-meta', text: fmtBytes(f.bytes.length) }),
        el('button', { class: 'icon-btn', html: I.up, title: 'Subir', onclick: () => { if (i > 0) { [files[i - 1], files[i]] = [files[i], files[i - 1]]; render(); } } }),
        el('button', { class: 'icon-btn', html: I.down, title: 'Bajar', onclick: () => { if (i < files.length - 1) { [files[i + 1], files[i]] = [files[i], files[i + 1]]; render(); } } }),
        el('button', { class: 'icon-btn danger', html: I.trash, title: 'Quitar', onclick: () => { files.splice(i, 1); render(); } }),
      ]));
    });
    listWrap.append(list);
    listWrap.append(el('div', { class: 'actions' }, [
      el('button', { class: 'btn btn-ghost', html: I.upload + ' Añadir más', onclick: () => dz.click() }),
      el('button', { class: 'btn btn-primary', html: I.save + ' Unir y guardar', disabled: files.length < 2 ? '' : null, onclick: run }),
      el('span', { class: 'hint', text: files.length < 2 ? 'Añade al menos 2 PDF.' : `${files.length} archivos listos.` }),
    ]));
  }

  async function run() {
    busy(true, 'Uniendo PDF…');
    try {
      const out = await PDFDocument.create();
      for (const f of files) {
        const src = await PDFDocument.load(f.bytes, { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      busy(false);
      const path = await savePdf(bytes, 'unido-nagi.pdf');
      if (path) { listWrap.querySelector('.result')?.remove(); resultCard(listWrap, '¡PDF unido!', `${files.length} archivos · ${fmtBytes(bytes.length)}`, path); }
    } catch (e) { busy(false); toast('Error al unir: ' + e.message, 'err'); }
  }
}

/* ---------- 2. ORGANIZAR (reordenar/rotar/borrar) ---------- */
function toolOrganize(tool, initialFiles) {
  const body = toolFrame(tool);
  let srcBytes = null, pdfDoc = null;
  let pages = []; // {src, rot, removed}
  const area = el('div', {});
  dropzone(body, {
    accept: 'pdf', multiple: false,
    label: 'Suelta un PDF para organizarlo', sub: 'Verás todas las páginas en miniatura.',
    onfiles: (fs) => load(fs[0]),
  });
  body.append(area);
  if (initialFiles && initialFiles.length) load(initialFiles[0]);

  async function load(f) {
    busy(true, 'Cargando páginas…');
    try {
      srcBytes = f.bytes;
      pdfDoc = await loadPdfjs(srcBytes);
      pages = Array.from({ length: pdfDoc.numPages }, (_, i) => ({ src: i + 1, rot: 0, removed: false }));
      busy(false);
      await render();
    } catch (e) { busy(false); toast('No se pudo leer el PDF: ' + e.message, 'err'); }
  }

  async function render() {
    area.innerHTML = '';
    area.append(el('div', { class: 'actions' }, [
      el('button', { class: 'btn btn-primary', html: I.save + ' Guardar PDF', onclick: run }),
      el('span', { class: 'hint', text: `${pages.filter((p) => !p.removed).length} páginas en el resultado · arrastra para reordenar` }),
    ]));
    const grid = el('div', { class: 'page-grid' });
    area.append(grid);
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const cell = el('div', { class: 'page-cell' + (p.removed ? ' removed' : ''), draggable: 'true', 'data-i': i });
      const canvas = await renderPage(pdfDoc, p.src, 0.4);
      canvas.style.transform = `rotate(${p.rot}deg)`;
      cell.append(el('span', { class: 'pc-num', text: i + 1 }), canvas);
      cell.append(el('div', { class: 'pc-tools' }, [
        el('button', { class: 'icon-btn', html: I.rot, title: 'Girar', onclick: (e) => { e.stopPropagation(); p.rot = (p.rot + 90) % 360; render(); } }),
        el('button', { class: 'icon-btn danger', html: I.trash, title: p.removed ? 'Restaurar' : 'Borrar', onclick: (e) => { e.stopPropagation(); p.removed = !p.removed; render(); } }),
      ]));
      // drag & drop reordenar
      cell.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', i); cell.classList.add('dragging'); });
      cell.addEventListener('dragend', () => cell.classList.remove('dragging'));
      cell.addEventListener('dragover', (e) => { e.preventDefault(); cell.classList.add('over'); });
      cell.addEventListener('dragleave', () => cell.classList.remove('over'));
      cell.addEventListener('drop', (e) => {
        e.preventDefault(); cell.classList.remove('over');
        const from = +e.dataTransfer.getData('text/plain');
        const to = i;
        if (from === to) return;
        const [moved] = pages.splice(from, 1);
        pages.splice(to, 0, moved);
        render();
      });
      grid.append(cell);
    }
  }

  async function run() {
    const keep = pages.filter((p) => !p.removed);
    if (!keep.length) return toast('No queda ninguna página.', 'warn');
    busy(true, 'Guardando…');
    try {
      const src = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, keep.map((p) => p.src - 1));
      copied.forEach((pg, idx) => {
        const extra = keep[idx].rot;
        if (extra) pg.setRotation(degrees((pg.getRotation().angle + extra) % 360));
        out.addPage(pg);
      });
      const bytes = await out.save();
      busy(false);
      const path = await savePdf(bytes, 'organizado-nagi.pdf');
      if (path) resultCard(area, '¡Listo!', `${keep.length} páginas · ${fmtBytes(bytes.length)}`, path);
    } catch (e) { busy(false); toast('Error: ' + e.message, 'err'); }
  }
}

/* ---------- 3. DIVIDIR ---------- */
function toolSplit(tool) {
  const body = toolFrame(tool);
  let file = null, total = 0;
  const area = el('div', {});
  dropzone(body, {
    accept: 'pdf', multiple: false,
    label: 'Suelta el PDF a dividir', sub: 'Lo separaremos en varios archivos.',
    onfiles: async (fs) => { file = fs[0]; const d = await PDFDocument.load(file.bytes, { ignoreEncryption: true }); total = d.getPageCount(); render(); },
  });
  body.append(area);

  function render() {
    area.innerHTML = '';
    const modeSel = el('select', {}, [
      el('option', { value: 'each', text: 'Una página por archivo' }),
      el('option', { value: 'ranges', text: 'Por rangos (ej. 1-3, 4, 5-8)' }),
      el('option', { value: 'every', text: 'Cada N páginas' }),
    ]);
    const rangesIn = el('input', { type: 'text', placeholder: 'Ej.: 1-3, 4, 5-8' });
    const everyIn = el('input', { type: 'number', min: '1', value: '2' });
    const dynamic = el('div', { class: 'field' });
    const refresh = () => {
      dynamic.innerHTML = '';
      if (modeSel.value === 'ranges') dynamic.append(el('label', { text: 'Rangos (separados por comas)' }), rangesIn);
      else if (modeSel.value === 'every') dynamic.append(el('label', { text: 'Número de páginas por archivo' }), everyIn);
    };
    modeSel.addEventListener('change', refresh);
    const panel = el('div', { class: 'panel' }, [
      el('h4', { text: `Dividir · ${total} páginas` }),
      el('div', { class: 'field' }, [el('label', { text: 'Modo' }), modeSel]),
      dynamic,
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-primary', html: I.folder + ' Dividir y elegir carpeta', onclick: () => run(modeSel.value, rangesIn.value, +everyIn.value) }),
      ]),
    ]);
    refresh();
    area.append(panel);
  }

  function parseRanges(str, total) {
    const groups = [];
    for (const part of str.split(',').map((s) => s.trim()).filter(Boolean)) {
      const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) { const a = +m[1], b = +m[2]; const arr = []; for (let i = Math.min(a, b); i <= Math.max(a, b); i++) if (i >= 1 && i <= total) arr.push(i - 1); if (arr.length) groups.push(arr); }
      else if (/^\d+$/.test(part)) { const i = +part; if (i >= 1 && i <= total) groups.push([i - 1]); }
    }
    return groups;
  }

  async function run(mode, rangesStr, n) {
    if (!file) return;
    let groups = [];
    const src = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
    const tot = src.getPageCount();
    if (mode === 'each') groups = Array.from({ length: tot }, (_, i) => [i]);
    else if (mode === 'ranges') { groups = parseRanges(rangesStr, tot); if (!groups.length) return toast('Rangos no válidos.', 'warn'); }
    else { n = Math.max(1, n || 1); for (let i = 0; i < tot; i += n) groups.push(Array.from({ length: Math.min(n, tot - i) }, (_, k) => i + k)); }

    const folder = await window.nagi.pickFolder();
    if (!folder) return;
    busy(true, 'Dividiendo…');
    try {
      const base = file.name.replace(/\.pdf$/i, '');
      let count = 0;
      for (let g = 0; g < groups.length; g++) {
        const out = await PDFDocument.create();
        const pgs = await out.copyPages(src, groups[g]);
        pgs.forEach((p) => out.addPage(p));
        const bytes = await out.save();
        const label = groups[g].length === 1 ? `pag${groups[g][0] + 1}` : `${groups[g][0] + 1}-${groups[g][groups[g].length - 1] + 1}`;
        await window.nagi.writeInto(folder, `${base}_${label}.pdf`, bytes);
        count++;
      }
      busy(false);
      area.querySelector('.result')?.remove();
      resultCard(area, '¡PDF dividido!', `${count} archivos creados en la carpeta elegida.`, folder + '\\x');
    } catch (e) { busy(false); toast('Error: ' + e.message, 'err'); }
  }
}

/* ---------- 4. COMPRIMIR ---------- */
function toolCompress(tool) {
  const body = toolFrame(tool);
  let file = null;
  const area = el('div', {});
  dropzone(body, {
    accept: 'pdf', multiple: false,
    label: 'Suelta el PDF a comprimir', sub: 'Ideal para escaneos y documentos con imágenes.',
    onfiles: (fs) => { file = fs[0]; render(); },
  });
  body.append(area);

  function render() {
    area.innerHTML = '';
    let level = 'medium';
    const seg = el('div', { class: 'seg' });
    [['light', 'Ligera'], ['medium', 'Equilibrada'], ['strong', 'Máxima']].forEach(([v, lbl]) => {
      const b = el('button', { class: v === level ? 'on' : '', text: lbl, onclick: () => { level = v; [...seg.children].forEach((c) => c.classList.toggle('on', c === b)); } });
      seg.append(b);
    });
    area.append(el('div', { class: 'panel' }, [
      el('h4', { text: `Comprimir · ${file.name} (${fmtBytes(file.bytes.length)})` }),
      el('div', { class: 'field' }, [el('label', { text: 'Nivel de compresión' }), seg]),
      el('div', { class: 'note', text: 'La compresión rasteriza las páginas (las convierte en imagen). El texto dejará de ser seleccionable, pero el peso baja mucho. Perfecto para escaneos.' }),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-primary', html: I.save + ' Comprimir y guardar', onclick: () => run(level) }),
      ]),
    ]));
  }

  async function run(level) {
    const cfg = { light: { scale: 1.6, q: 0.82 }, medium: { scale: 1.3, q: 0.65 }, strong: { scale: 1.0, q: 0.5 } }[level];
    busy(true, 'Comprimiendo…');
    try {
      const pdf = await loadPdfjs(file.bytes);
      const out = await PDFDocument.create();
      for (let i = 1; i <= pdf.numPages; i++) {
        busy(true, `Comprimiendo página ${i}/${pdf.numPages}…`);
        const canvas = await renderPage(pdf, i, cfg.scale);
        const img = await out.embedJpg(dataUrlToBytes(canvas.toDataURL('image/jpeg', cfg.q)));
        const vp = (await pdf.getPage(i)).getViewport({ scale: 1 });
        const pg = out.addPage([vp.width, vp.height]);
        pg.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
      }
      const bytes = await out.save();
      busy(false);
      const saved = file.bytes.length - bytes.length;
      const pct = Math.max(0, Math.round((saved / file.bytes.length) * 100));
      const path = await savePdf(bytes, file.name.replace(/\.pdf$/i, '') + '-comprimido.pdf');
      if (path) {
        area.querySelector('.result')?.remove();
        resultCard(area, pct > 0 ? `¡${pct}% más ligero!` : 'Comprimido',
          `${fmtBytes(file.bytes.length)} → ${fmtBytes(bytes.length)}`, path);
      }
    } catch (e) { busy(false); toast('Error: ' + e.message, 'err'); }
  }
}

/* ---------- 5. IMÁGENES → PDF ---------- */
function toolImg2Pdf(tool, initialFiles) {
  const body = toolFrame(tool);
  let imgs = [];
  const listWrap = el('div', {});
  const dz = dropzone(body, {
    accept: 'image', multiple: true,
    label: 'Arrastra tus imágenes', sub: 'JPG, PNG, WEBP… Se ordenan como las coloques.',
    onfiles: (fs) => { imgs = imgs.concat(fs); render(); },
  });
  body.append(listWrap);
  if (initialFiles && initialFiles.length) { imgs = imgs.concat(initialFiles); render(); }

  function render() {
    listWrap.innerHTML = '';
    if (!imgs.length) return;
    const list = el('div', { class: 'filelist' });
    imgs.forEach((f, i) => {
      list.append(el('div', { class: 'file-row' }, [
        el('span', { class: 'fr-num', text: i + 1 }),
        el('span', { class: 'fr-name', text: f.name }),
        el('button', { class: 'icon-btn', html: I.up, onclick: () => { if (i > 0) { [imgs[i - 1], imgs[i]] = [imgs[i], imgs[i - 1]]; render(); } } }),
        el('button', { class: 'icon-btn', html: I.down, onclick: () => { if (i < imgs.length - 1) { [imgs[i + 1], imgs[i]] = [imgs[i], imgs[i + 1]]; render(); } } }),
        el('button', { class: 'icon-btn danger', html: I.trash, onclick: () => { imgs.splice(i, 1); render(); } }),
      ]));
    });
    listWrap.append(list);
    const sizeSel = el('select', {}, [
      el('option', { value: 'fit', text: 'Ajustar página a la imagen' }),
      el('option', { value: 'a4', text: 'A4 (vertical)' }),
      el('option', { value: 'a4l', text: 'A4 (horizontal)' }),
      el('option', { value: 'letter', text: 'Carta (vertical)' }),
    ]);
    listWrap.append(el('div', { class: 'panel' }, [
      el('div', { class: 'field' }, [el('label', { text: 'Tamaño de página' }), sizeSel]),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-ghost', html: I.upload + ' Añadir más', onclick: () => dz.click() }),
        el('button', { class: 'btn btn-primary', html: I.save + ' Crear PDF', onclick: () => run(sizeSel.value) }),
      ]),
    ]));
  }

  // convierte cualquier imagen a PNG/JPG embebible
  async function toEmbed(out, f) {
    const isPng = /\.png$/i.test(f.name);
    const isJpg = /\.jpe?g$/i.test(f.name);
    if (isJpg) return { img: await out.embedJpg(f.bytes), };
    if (isPng) return { img: await out.embedPng(f.bytes) };
    // otros formatos → pasar por canvas a PNG
    const blob = new Blob([f.bytes]);
    const bmp = await createImageBitmap(blob);
    const c = el('canvas'); c.width = bmp.width; c.height = bmp.height;
    c.getContext('2d').drawImage(bmp, 0, 0);
    const png = await new Promise((res) => c.toBlob((b) => b.arrayBuffer().then(res), 'image/png'));
    return { img: await out.embedPng(new Uint8Array(png)) };
  }

  async function run(size) {
    busy(true, 'Creando PDF…');
    try {
      const out = await PDFDocument.create();
      const PAGES = { a4: [595.28, 841.89], a4l: [841.89, 595.28], letter: [612, 792] };
      for (const f of imgs) {
        const { img } = await toEmbed(out, f);
        if (size === 'fit') {
          const pg = out.addPage([img.width, img.height]);
          pg.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        } else {
          const [pw, ph] = PAGES[size];
          const pg = out.addPage([pw, ph]);
          const m = 24; const aw = pw - m * 2, ah = ph - m * 2;
          const r = Math.min(aw / img.width, ah / img.height);
          const w = img.width * r, h = img.height * r;
          pg.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
        }
      }
      const bytes = await out.save();
      busy(false);
      const path = await savePdf(bytes, 'imagenes-nagi.pdf');
      if (path) { listWrap.querySelector('.result')?.remove(); resultCard(listWrap, '¡PDF creado!', `${imgs.length} imágenes · ${fmtBytes(bytes.length)}`, path); }
    } catch (e) { busy(false); toast('Error: ' + e.message, 'err'); }
  }
}

/* ---------- 6. PDF → IMÁGENES ---------- */
function toolPdf2Img(tool, initialFiles) {
  const body = toolFrame(tool);
  let file = null;
  const area = el('div', {});
  dropzone(body, {
    accept: 'pdf', multiple: false,
    label: 'Suelta el PDF', sub: 'Cada página se exportará como imagen.',
    onfiles: (fs) => { file = fs[0]; render(); },
  });
  body.append(area);
  if (initialFiles && initialFiles.length) { file = initialFiles[0]; render(); }

  function render() {
    area.innerHTML = '';
    const fmt = el('select', {}, [el('option', { value: 'png', text: 'PNG (máxima calidad)' }), el('option', { value: 'jpg', text: 'JPG (más ligero)' })]);
    const qual = el('select', {}, [el('option', { value: '1', text: 'Normal' }), el('option', { value: '2', text: 'Alta (x2)' }), el('option', { value: '3', text: 'Muy alta (x3)' })]);
    area.append(el('div', { class: 'panel' }, [
      el('h4', { text: `Exportar · ${file.name}` }),
      el('div', { class: 'row' }, [
        el('div', { class: 'field' }, [el('label', { text: 'Formato' }), fmt]),
        el('div', { class: 'field' }, [el('label', { text: 'Calidad' }), qual]),
      ]),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-primary', html: I.folder + ' Exportar a carpeta', onclick: () => run(fmt.value, +qual.value) }),
      ]),
    ]));
  }

  async function run(fmt, scale) {
    const folder = await window.nagi.pickFolder();
    if (!folder) return;
    busy(true, 'Exportando…');
    try {
      const pdf = await loadPdfjs(file.bytes);
      const base = file.name.replace(/\.pdf$/i, '');
      for (let i = 1; i <= pdf.numPages; i++) {
        busy(true, `Exportando página ${i}/${pdf.numPages}…`);
        const canvas = await renderPage(pdf, i, scale * 1.5);
        const mime = fmt === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, 0.9);
        const bin = atob(dataUrl.split(',')[1]);
        const arr = new Uint8Array(bin.length);
        for (let k = 0; k < bin.length; k++) arr[k] = bin.charCodeAt(k);
        await window.nagi.writeInto(folder, `${base}_pag${String(i).padStart(2, '0')}.${fmt}`, arr);
      }
      busy(false);
      area.querySelector('.result')?.remove();
      resultCard(area, '¡Imágenes exportadas!', `${pdf.numPages} imágenes en la carpeta elegida.`, folder + '\\x');
    } catch (e) { busy(false); toast('Error: ' + e.message, 'err'); }
  }
}

/* ---------- 7. PROTEGER CON CONTRASEÑA ---------- */
function toolProtect(tool) {
  const body = toolFrame(tool);
  let file = null;
  const area = el('div', {});
  dropzone(body, {
    accept: 'pdf', multiple: false,
    label: 'Suelta el PDF a proteger', sub: 'Le pondremos una contraseña de apertura.',
    onfiles: (fs) => { file = fs[0]; render(); },
  });
  body.append(area);

  function render() {
    area.innerHTML = '';
    const p1 = el('input', { type: 'password', placeholder: 'Contraseña' });
    const p2 = el('input', { type: 'password', placeholder: 'Repite la contraseña' });
    const allowPrint = el('input', { type: 'checkbox', checked: 'checked' });
    const allowCopy = el('input', { type: 'checkbox', checked: 'checked' });
    area.append(el('div', { class: 'panel' }, [
      el('h4', { text: `Proteger · ${file.name}` }),
      el('div', { class: 'row' }, [
        el('div', { class: 'field' }, [el('label', { text: 'Contraseña' }), p1]),
        el('div', { class: 'field' }, [el('label', { text: 'Repetir' }), p2]),
      ]),
      el('label', { class: 'check' }, [allowPrint, 'Permitir imprimir']),
      el('label', { class: 'check' }, [allowCopy, 'Permitir copiar texto']),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-amber', html: I.protect + ' Proteger y guardar', onclick: () => run(p1.value, p2.value, allowPrint.checked, allowCopy.checked) }),
      ]),
    ]));
  }

  async function run(pw, pw2, canPrint, canCopy) {
    if (!pw) return toast('Escribe una contraseña.', 'warn');
    if (pw !== pw2) return toast('Las contraseñas no coinciden.', 'warn');
    busy(true, 'Cifrando…');
    try {
      const doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
      doc.encrypt({
        userPassword: pw,
        ownerPassword: pw,
        permissions: { printing: canPrint ? 'highResolution' : undefined, copying: canCopy, modifying: false },
      });
      const bytes = await doc.save();
      busy(false);
      const path = await savePdf(bytes, file.name.replace(/\.pdf$/i, '') + '-protegido.pdf');
      if (path) { area.querySelector('.result')?.remove(); resultCard(area, '¡PDF protegido!', 'Se pedirá la contraseña al abrirlo.', path); }
    } catch (e) { busy(false); toast('Error al cifrar: ' + e.message, 'err'); }
  }
}

/* ---------- 8. MARCA DE AGUA ---------- */
function toolWatermark(tool) {
  const body = toolFrame(tool);
  let file = null;
  const area = el('div', {});
  dropzone(body, {
    accept: 'pdf', multiple: false,
    label: 'Suelta el PDF', sub: 'Estamparemos un texto en todas las páginas.',
    onfiles: (fs) => { file = fs[0]; render(); },
  });
  body.append(area);

  function render() {
    area.innerHTML = '';
    const txt = el('input', { type: 'text', value: 'CONFIDENCIAL' });
    const op = el('input', { type: 'range', min: '5', max: '60', value: '18' });
    const sz = el('input', { type: 'number', value: '60', min: '10' });
    const colorSel = el('select', {}, [
      el('option', { value: 'grey', text: 'Gris' }), el('option', { value: 'turq', text: 'Turquesa' }),
      el('option', { value: 'amber', text: 'Ámbar' }), el('option', { value: 'red', text: 'Rojo' }),
    ]);
    const diag = el('input', { type: 'checkbox', checked: 'checked' });
    area.append(el('div', { class: 'panel' }, [
      el('h4', { text: `Marca de agua · ${file.name}` }),
      el('div', { class: 'field' }, [el('label', { text: 'Texto' }), txt]),
      el('div', { class: 'row' }, [
        el('div', { class: 'field' }, [el('label', { text: 'Tamaño' }), sz]),
        el('div', { class: 'field' }, [el('label', { text: 'Color' }), colorSel]),
      ]),
      el('div', { class: 'field' }, [el('label', { text: 'Opacidad' }), op]),
      el('label', { class: 'check' }, [diag, 'En diagonal']),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-primary', html: I.save + ' Aplicar y guardar', onclick: () => run(txt.value, +op.value / 100, +sz.value, colorSel.value, diag.checked) }),
      ]),
    ]));
  }

  async function run(text, opacity, size, color, diagonal) {
    if (!text.trim()) return toast('Escribe el texto.', 'warn');
    const COL = { grey: rgb(0.5, 0.5, 0.5), turq: rgb(0.28, 0.69, 0.70), amber: rgb(0.97, 0.67, 0.24), red: rgb(0.9, 0.3, 0.3) };
    busy(true, 'Aplicando marca de agua…');
    try {
      const doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(text, size);
        page.drawText(text, {
          x: width / 2 - (diagonal ? tw / 2 * Math.cos(Math.PI / 4) : tw / 2),
          y: height / 2 - (diagonal ? tw / 2 * Math.sin(Math.PI / 4) : 0),
          size, font, color: COL[color], opacity,
          rotate: diagonal ? degrees(45) : degrees(0),
        });
      }
      const bytes = await doc.save();
      busy(false);
      const path = await savePdf(bytes, file.name.replace(/\.pdf$/i, '') + '-marca.pdf');
      if (path) { area.querySelector('.result')?.remove(); resultCard(area, '¡Marca de agua aplicada!', `En ${doc.getPageCount()} páginas.`, path); }
    } catch (e) { busy(false); toast('Error: ' + e.message, 'err'); }
  }
}

/* ---------- 9. NUMERAR PÁGINAS ---------- */
function toolNumbers(tool) {
  const body = toolFrame(tool);
  let file = null;
  const area = el('div', {});
  dropzone(body, {
    accept: 'pdf', multiple: false,
    label: 'Suelta el PDF', sub: 'Añadiremos el número en cada página.',
    onfiles: (fs) => { file = fs[0]; render(); },
  });
  body.append(area);

  function render() {
    area.innerHTML = '';
    const pos = el('select', {}, [
      el('option', { value: 'bc', text: 'Abajo centro' }), el('option', { value: 'br', text: 'Abajo derecha' }),
      el('option', { value: 'bl', text: 'Abajo izquierda' }), el('option', { value: 'tc', text: 'Arriba centro' }),
      el('option', { value: 'tr', text: 'Arriba derecha' }),
    ]);
    const fmt = el('select', {}, [
      el('option', { value: 'n', text: '1, 2, 3…' }), el('option', { value: 'nN', text: '1 / N' }),
      el('option', { value: 'page', text: 'Página 1 de N' }),
    ]);
    const start = el('input', { type: 'number', value: '1', min: '1' });
    const sz = el('input', { type: 'number', value: '11', min: '6' });
    area.append(el('div', { class: 'panel' }, [
      el('h4', { text: `Numerar · ${file.name}` }),
      el('div', { class: 'row' }, [
        el('div', { class: 'field' }, [el('label', { text: 'Posición' }), pos]),
        el('div', { class: 'field' }, [el('label', { text: 'Formato' }), fmt]),
      ]),
      el('div', { class: 'row' }, [
        el('div', { class: 'field' }, [el('label', { text: 'Empezar en' }), start]),
        el('div', { class: 'field' }, [el('label', { text: 'Tamaño' }), sz]),
      ]),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-primary', html: I.save + ' Numerar y guardar', onclick: () => run(pos.value, fmt.value, +start.value, +sz.value) }),
      ]),
    ]));
  }

  async function run(pos, fmt, start, size) {
    busy(true, 'Numerando…');
    try {
      const doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const N = pages.length;
      pages.forEach((page, idx) => {
        const num = start + idx;
        const label = fmt === 'nN' ? `${num} / ${start + N - 1}` : fmt === 'page' ? `Página ${num} de ${start + N - 1}` : `${num}`;
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(label, size);
        const m = 28;
        let x = width / 2 - tw / 2, y = m;
        if (pos[1] === 'r') x = width - m - tw; else if (pos[1] === 'l') x = m;
        if (pos[0] === 't') y = height - m - size;
        page.drawText(label, { x, y, size, font, color: rgb(0.35, 0.35, 0.4) });
      });
      const bytes = await doc.save();
      busy(false);
      const path = await savePdf(bytes, file.name.replace(/\.pdf$/i, '') + '-numerado.pdf');
      if (path) { area.querySelector('.result')?.remove(); resultCard(area, '¡Páginas numeradas!', `${N} páginas.`, path); }
    } catch (e) { busy(false); toast('Error: ' + e.message, 'err'); }
  }
}

/* ---------- 10. FIRMAR ---------- */
function toolSign(tool) {
  const body = toolFrame(tool);
  let file = null, pdf = null, sigDataUrl = null;
  const area = el('div', {});
  dropzone(body, {
    accept: 'pdf', multiple: false,
    label: 'Suelta el PDF a firmar', sub: 'Dibuja tu firma y colócala donde quieras.',
    onfiles: async (fs) => { file = fs[0]; pdf = await loadPdfjs(file.bytes); render(); },
  });
  body.append(area);

  function render() {
    area.innerHTML = '';
    // --- panel firma ---
    const padCanvas = el('canvas', { class: 'sign-pad' });
    const wrap = el('div', { class: 'sign-pad-wrap' }, [padCanvas]);
    const panel = el('div', { class: 'panel' }, [
      el('h4', { text: '1 · Dibuja tu firma' }),
      wrap,
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-ghost', text: 'Borrar', onclick: clearPad }),
        el('span', { class: 'hint', text: 'Dibuja con el ratón (o el dedo en pantalla táctil).' }),
      ]),
    ]);
    area.append(panel);

    // setup pad
    let drawing = false, ctx, last;
    const setup = () => {
      const r = padCanvas.getBoundingClientRect();
      padCanvas.width = r.width; padCanvas.height = r.height;
      ctx = padCanvas.getContext('2d');
      ctx.strokeStyle = '#10243a'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    };
    const pt = (e) => { const r = padCanvas.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; };
    const down = (e) => { e.preventDefault(); drawing = true; last = pt(e); };
    const move = (e) => { if (!drawing) return; e.preventDefault(); const p = pt(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; sigDataUrl = padCanvas.toDataURL('image/png'); };
    const up = () => { drawing = false; };
    setTimeout(setup, 30);
    padCanvas.addEventListener('mousedown', down); padCanvas.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    padCanvas.addEventListener('touchstart', down); padCanvas.addEventListener('touchmove', move); padCanvas.addEventListener('touchend', up);
    function clearPad() { ctx.clearRect(0, 0, padCanvas.width, padCanvas.height); sigDataUrl = null; }

    // --- panel colocar ---
    const placePanel = el('div', { class: 'panel' }, [el('h4', { text: '2 · Coloca la firma en una página' })]);
    const pageSel = el('select', {});
    for (let i = 1; i <= pdf.numPages; i++) pageSel.append(el('option', { value: i, text: 'Página ' + i }));
    placePanel.append(el('div', { class: 'field' }, [el('label', { text: 'Página' }), pageSel]));
    const previewHost = el('div', {});
    placePanel.append(previewHost);
    placePanel.append(el('div', { class: 'actions' }, [
      el('button', { class: 'btn btn-primary', html: I.save + ' Firmar y guardar', onclick: apply }),
      el('span', { class: 'hint', text: 'Arrastra el recuadro de la firma; tira de la esquina para cambiar el tamaño.' }),
    ]));
    area.append(placePanel);

    let stampState = { x: 40, y: 40, w: 160, h: 70, pageW: 1, pageH: 1, viewW: 1 };
    async function buildPreview() {
      previewHost.innerHTML = '';
      const n = +pageSel.value;
      const pageObj = await pdf.getPage(n);
      const vp0 = pageObj.getViewport({ scale: 1 });
      const scale = Math.min(520 / vp0.width, 1.4);
      const canvas = await renderPage(pdf, n, scale);
      const pw = el('div', { class: 'sign-preview-wrap' }, [canvas]);
      stampState = { x: 40, y: 40, w: 160, h: 70, pageW: vp0.width, pageH: vp0.height, viewW: canvas.width, viewScale: scale };
      if (!sigDataUrl) { previewHost.append(pw, el('div', { class: 'empty-mini', text: 'Dibuja primero tu firma arriba.' })); return; }
      const stamp = el('div', { class: 'sign-stamp', style: `left:${stampState.x}px;top:${stampState.y}px;width:${stampState.w}px;height:${stampState.h}px` }, [
        el('img', { src: sigDataUrl }), el('div', { class: 'handle' }),
      ]);
      pw.append(stamp);
      // drag
      let mode = null, sx, sy, ox, oy, ow, oh;
      stamp.addEventListener('mousedown', (e) => {
        mode = e.target.classList.contains('handle') ? 'resize' : 'move';
        sx = e.clientX; sy = e.clientY; ox = stampState.x; oy = stampState.y; ow = stampState.w; oh = stampState.h; e.preventDefault();
      });
      window.addEventListener('mousemove', (e) => {
        if (!mode) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (mode === 'move') { stampState.x = Math.max(0, ox + dx); stampState.y = Math.max(0, oy + dy); stamp.style.left = stampState.x + 'px'; stamp.style.top = stampState.y + 'px'; }
        else { stampState.w = Math.max(40, ow + dx); stampState.h = Math.max(20, oh + dy); stamp.style.width = stampState.w + 'px'; stamp.style.height = stampState.h + 'px'; }
      });
      window.addEventListener('mouseup', () => { mode = null; });
      previewHost.append(pw);
    }
    pageSel.addEventListener('change', buildPreview);
    setTimeout(buildPreview, 60);

    async function apply() {
      if (!sigDataUrl) return toast('Dibuja tu firma primero.', 'warn');
      busy(true, 'Firmando…');
      try {
        const doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
        const png = await doc.embedPng(dataUrlToBytes(sigDataUrl));
        const page = doc.getPages()[+pageSel.value - 1];
        const { width, height } = page.getSize();
        const sc = width / stampState.viewW; // escala vista → puntos PDF
        const w = stampState.w * sc, h = stampState.h * sc;
        const x = stampState.x * sc;
        const y = height - (stampState.y * sc) - h; // origen PDF abajo-izquierda
        page.drawImage(png, { x, y, width: w, height: h });
        const bytes = await doc.save();
        busy(false);
        const path = await savePdf(bytes, file.name.replace(/\.pdf$/i, '') + '-firmado.pdf');
        if (path) { area.querySelector('.result')?.remove(); resultCard(area, '¡PDF firmado!', 'Tu firma se ha estampado en la página ' + pageSel.value + '.', path); }
      } catch (e) { busy(false); toast('Error: ' + e.message, 'err'); }
    }
  }
}

/* ---------------- Apertura desde el menú contextual de Windows ---------------- */
window.nagi.onOpen((payload) => {
  if (!payload) return;
  const files = (payload.files || []).map((f) => ({ name: f.name, bytes: new Uint8Array(f.data), path: f.path }));
  const map = { viewer: 'viewer', open: 'viewer', merge: 'merge', img2pdf: 'img2pdf', pdf2img: 'pdf2img' };
  const toolId = map[payload.action] || 'viewer';
  if (toolId === 'merge' && files.length === 1) {
    // un solo PDF con "combinar" no tiene sentido → lo abrimos en el visor
    openTool('viewer', files);
  } else if (files.length) {
    openTool(toolId, files);
  }
});

/* ---------------- Arranque ---------------- */
bindKeys();
bindDrop();
buildSidebar();
openHome();
