const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('meyAPI', {
  defaultRoots: () => ipcRenderer.invoke('roots'),
  scan: roots => ipcRenderer.invoke('scan', roots),
  pickFolder: () => ipcRenderer.invoke('pick-folder'),
  openFiles: () => ipcRenderer.invoke('open-files'),
  saveFile: (name, bytes) => ipcRenderer.invoke('save-file', name, bytes),
  showItem: p => ipcRenderer.invoke('show-item', p),
  win: a => ipcRenderer.invoke('win', a),
  initialFiles: () => ipcRenderer.invoke('initial-files'),
  fileUrl: p => 'mey://media/?p=' + encodeURIComponent(p),
  pathForFile: f => { try { return webUtils.getPathForFile(f); } catch { return f.path || null; } },
  onOpenFile: cb => ipcRenderer.on('open-file', (_e, files) => cb(files)),
});
