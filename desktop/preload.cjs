const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('wupaiDesktop', Object.freeze({
  download: (url, name) => ipcRenderer.invoke('wupai:download', url, name),
}));
