// Nagi PDF Studio — proceso principal de Electron
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const path = require('path');
const os = require('os');

let win;
let pending = { action: null, files: [] };
let flushTimer = null;

const FILE_RE = /\.(pdf|png|jpe?g|webp|gif|bmp)$/i;

// La aceleración por GPU provoca, en algunos equipos, páginas impresas en negro
// o en blanco (la ventana oculta de impresión se compone en la GPU y no vuelca
// bien su contenido). Desactivarla hace la impresión fiable; el visor usa lienzo
// 2D (CPU), así que no se nota en el uso normal.
app.disableHardwareAcceleration();

// ---- Una sola instancia: los clics derechos abren un proceso por archivo;
//      los reunimos todos en la primera instancia. ----
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    handleArgv(argv);
    ensureWindow();
  });

  app.whenReady().then(() => {
    handleArgv(process.argv);
    createWindow();
    setupAutoUpdate();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function createWindow() {
  win = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 940,
    minHeight: 620,
    backgroundColor: '#0E0B1A',
    show: false,
    icon: path.join(__dirname, 'src', 'assets', 'icon.ico'),
    title: 'Nagi PDF Studio',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0E0B1A',
      symbolColor: '#E7E3F5',
      height: 44,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  win.removeMenu();
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.once('ready-to-show', () => { if (win && !win.isDestroyed()) win.show(); });
  win.webContents.on('did-finish-load', () => scheduleFlush());
  // Red de seguridad: si en 2s no se mostró (p. ej. fallo de pintado), mostrarla igual.
  setTimeout(() => { if (win && !win.isDestroyed() && !win.isVisible()) win.show(); }, 2000);
  // Al cerrar la ventana principal, salir del todo (cierra ventanas ocultas de impresión
  // y libera el candado de instancia única) → nunca quedan procesos "zombie" sin ventana.
  win.on('closed', () => {
    win = null;
    if (process.platform !== 'darwin') app.quit();
  });
}

// ---- Auto-actualización desde las Releases de GitHub (electron-updater) ----
// Solo en la app instalada. Descarga en segundo plano y ofrece reiniciar para instalar.
function setupAutoUpdate() {
  if (!app.isPackaged) return; // en desarrollo no hay nada que actualizar
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-downloaded', (info) => {
    if (!win || win.isDestroyed()) return;
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Actualización disponible',
      message: 'Nagi PDF Studio ' + (info && info.version ? info.version : '') + ' está lista.',
      detail: 'Se instalará al reiniciar la app. ¿Reiniciar ahora?',
      buttons: ['Reiniciar ahora', 'Más tarde'],
      defaultId: 0, cancelId: 1, noLink: true,
    }).then((r) => { if (r.response === 0) { setImmediate(() => autoUpdater.quitAndInstall()); } }).catch(() => {});
  });
  autoUpdater.on('error', () => {}); // sin conexión / sin permisos → silencioso, no molestar
  try { autoUpdater.checkForUpdates(); } catch (e) {}
}

// Garantiza que hay una ventana visible y enfocada (crea una nueva si hace falta).
function ensureWindow() {
  if (!win || win.isDestroyed()) { createWindow(); return; }
  if (!win.isVisible()) win.show();
  if (win.isMinimized()) win.restore();
  win.focus();
}

// ---- Argumentos de línea de comandos (--nagi=accion + rutas de archivo) ----
function parseArgs(argv) {
  let action = null;
  const files = [];
  for (const a of argv) {
    if (typeof a !== 'string') continue;
    if (a.startsWith('--nagi=')) action = a.slice(7);
    else if (FILE_RE.test(a) && fs.existsSync(a)) files.push(a);
  }
  return { action, files };
}

function handleArgv(argv) {
  const { action, files } = parseArgs(argv);
  if (action) pending.action = action;
  for (const f of files) if (!pending.files.includes(f)) pending.files.push(f);
  scheduleFlush();
}

function scheduleFlush() {
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 450);
}

function flush() {
  if (!pending.files.length && !pending.action) return;
  // ventana aún no disponible o destruida: si no existe del todo, abandonar (no reprogramar en bucle)
  if (!win || win.isDestroyed() || win.webContents.isDestroyed()) return;
  if (win.webContents.isLoading()) { scheduleFlush(); return; }
  const payload = {
    action: pending.action || 'open',
    files: pending.files.map((p) => ({ name: path.basename(p), path: p, data: fs.readFileSync(p) })),
  };
  pending = { action: null, files: [] };
  try {
    win.webContents.send('nagi:open', payload);
  } catch (e) { /* ventana cerrada mientras tanto */ }
}

// ---- IPC: abrir archivos (PDF o imágenes) ----
ipcMain.handle('dialog:open', async (_e, opts = {}) => {
  const filters = opts.images
    ? [{ name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'] }]
    : [{ name: 'PDF', extensions: ['pdf'] }];
  const res = await dialog.showOpenDialog(win, {
    title: opts.images ? 'Elige imágenes' : 'Elige uno o varios PDF',
    properties: ['openFile', 'multiSelections'],
    filters,
  });
  if (res.canceled) return [];
  return res.filePaths.map((p) => ({
    name: path.basename(p),
    path: p,
    data: fs.readFileSync(p),
  }));
});

// ---- IPC: guardar un archivo ----
ipcMain.handle('dialog:save', async (_e, { defaultName, data, filters }) => {
  const res = await dialog.showSaveDialog(win, {
    title: 'Guardar',
    defaultPath: defaultName,
    filters: filters || [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (res.canceled || !res.filePath) return null;
  fs.writeFileSync(res.filePath, Buffer.from(data));
  return res.filePath;
});

// ---- IPC: elegir carpeta (para dividir / exportar imágenes) ----
ipcMain.handle('dialog:pickFolder', async () => {
  const res = await dialog.showOpenDialog(win, {
    title: 'Elige la carpeta donde guardar',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (res.canceled || !res.filePaths.length) return null;
  return res.filePaths[0];
});

// ---- IPC: escribir un archivo dentro de una carpeta ----
ipcMain.handle('fs:writeInto', async (_e, { folder, name, data }) => {
  const safe = name.replace(/[\\/:*?"<>|]/g, '_');
  const full = path.join(folder, safe);
  fs.writeFileSync(full, Buffer.from(data));
  return full;
});

// ---- IPC: abrir una carpeta en el explorador ----
ipcMain.handle('shell:openPath', async (_e, p) => {
  await shell.openPath(p);
});

// ---- IPC (síncrono): ruta base de los assets de OCR (fuera del asar) ----
ipcMain.on('tess-base', (e) => {
  const dir = path.join(process.resourcesPath, 'tesseract');
  e.returnValue = 'file:///' + encodeURI(dir.replace(/\\/g, '/'));
});

// ---- IPC: leer un archivo por su ruta (para "Recientes") ----
ipcMain.handle('fs:read', async (_e, p) => {
  try {
    if (!p || !fs.existsSync(p)) return null;
    return { name: path.basename(p), path: p, data: fs.readFileSync(p) };
  } catch (e) { return null; }
});

// ---- IPC: sobrescribir un archivo existente por su ruta (Guardar directo) ----
ipcMain.handle('fs:overwrite', async (_e, { path: p, data }) => {
  try { if (!p) return false; fs.writeFileSync(p, Buffer.from(data)); return true; }
  catch (e) { return false; }
});

// ---- IPC: lista de impresoras del sistema ----
ipcMain.handle('getPrinters', async () => {
  try {
    if (win && !win.isDestroyed()) return await win.webContents.getPrintersAsync();
  } catch (e) {}
  return [];
});

// ---- IPC: imprimir un PDF (lo carga en una ventana oculta con el visor de Chromium) ----
ipcMain.handle('print', async (_e, payload) => {
  // compatibilidad: payload puede ser bytes (antiguo) o { data, options } (nuevo)
  const data = payload && payload.data ? payload.data : payload;
  const options = (payload && payload.options) || {};
  const buf = Buffer.from(data);
  let tmp = null, w = null, cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    try { if (w && !w.isDestroyed()) w.destroy(); } catch (e) {}
    try { if (tmp) fs.unlinkSync(tmp); } catch (e) {}
  };
  try {
    tmp = path.join(os.tmpdir(), 'nagi-print-' + process.hrtime.bigint() + '.pdf');
    fs.writeFileSync(tmp, buf);
    w = new BrowserWindow({
      show: false,
      backgroundColor: '#ffffff', // fondo blanco: evita que salgan páginas en negro
      webPreferences: { plugins: true, backgroundThrottling: false },
    });
    await w.loadURL('file:///' + tmp.replace(/\\/g, '/'));

    // pdfium dibuja el PDF de forma asíncrona. Esperamos a que termine de cargar
    // y damos un margen proporcional al tamaño (más páginas → más tiempo de pintado),
    // para no mandar a imprimir antes de tiempo (causa de atascos y páginas en blanco).
    await new Promise((r) => {
      let done = false; const go = () => { if (!done) { done = true; r(); } };
      if (!w.webContents.isLoading()) go();
      else w.webContents.once('did-stop-loading', go);
      setTimeout(go, 5000); // tope por si el evento no llega
    });
    const sizeMb = buf.length / (1024 * 1024);
    await new Promise((r) => setTimeout(r, Math.min(5000, 700 + sizeMb * 220)));

    const printOpts = {
      silent: !!options.deviceName,        // con impresora elegida → directo; sin ella → diálogo del sistema
      printBackground: false,              // NO pintar el fondo del visor de Chromium (era lo que ennegrecía)
      color: true,
      margins: { marginType: 'none' },
    };
    if (options.deviceName) printOpts.deviceName = options.deviceName;
    if (options.copies) printOpts.copies = Math.max(1, options.copies | 0);
    if (options.landscape != null) printOpts.landscape = !!options.landscape;
    if (options.pageRanges && options.pageRanges.length) printOpts.pageRanges = options.pageRanges;

    // Esperamos al callback real de impresión y NO destruimos la ventana antes de tiempo
    // (el fallo anterior la cerraba a los 60 s, abortando los trabajos largos a mitad).
    const ok = await new Promise((resolve) => {
      let settled = false;
      const finish = (v) => { if (settled) return; settled = true; cleanup(); resolve(v); };
      try { w.webContents.print(printOpts, (success) => finish(success)); }
      catch (e) { finish(false); }
      setTimeout(() => finish(true), 8 * 60 * 1000); // red de seguridad amplia para trabajos grandes
    });
    return ok;
  } catch (e) {
    cleanup();
    return false;
  }
});
