const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close')
});

window.alert = (message) => {
  ipcRenderer.sendSync('show-alert', message);
};

window.confirm = (message) => {
  return ipcRenderer.sendSync('show-confirm', message);
};

window.prompt = (message, defaultValue = '') => {
  return ipcRenderer.sendSync('show-prompt', message, defaultValue);
};