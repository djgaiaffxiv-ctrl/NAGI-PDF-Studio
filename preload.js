// Puente seguro entre la interfaz y el sistema (abrir/guardar archivos).
const { contextBridge, ipcRenderer } = require('electron');
// Carpeta (fuera del asar) con el motor OCR — la ruta la calcula el proceso main (preload va en sandbox).
let tessBase = '';
try { tessBase = ipcRenderer.sendSync('tess-base'); } catch (e) {}

contextBridge.exposeInMainWorld('nagi', {
  tessBase,
  openPdfs: () => ipcRenderer.invoke('dialog:open', { images: false }),
  openImages: () => ipcRenderer.invoke('dialog:open', { images: true }),
  save: (defaultName, data, filters) =>
    ipcRenderer.invoke('dialog:save', { defaultName, data, filters }),
  pickFolder: () => ipcRenderer.invoke('dialog:pickFolder'),
  writeInto: (folder, name, data) =>
    ipcRenderer.invoke('fs:writeInto', { folder, name, data }),
  openPath: (p) => ipcRenderer.invoke('shell:openPath', p),
  readFile: (p) => ipcRenderer.invoke('fs:read', p),
  overwrite: (p, data) => ipcRenderer.invoke('fs:overwrite', { path: p, data }),
  getPrinters: () => ipcRenderer.invoke('getPrinters'),
  print: (data, options) => ipcRenderer.invoke('print', { data, options }),
  onOpen: (cb) => ipcRenderer.on('nagi:open', (_e, payload) => cb(payload)),
});
