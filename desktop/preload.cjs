const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('wupaiDesktop', Object.freeze({
  getExportPreferences:()=>ipcRenderer.invoke('wupai:export-preferences'),
  chooseExportDirectory:()=>ipcRenderer.invoke('wupai:export-choose'),
  setExportAsk:value=>ipcRenderer.invoke('wupai:export-ask',value),
  resetExportDirectory:()=>ipcRenderer.invoke('wupai:export-reset'),
  download: (url, name) => ipcRenderer.invoke('wupai:download', url, name),
}));
