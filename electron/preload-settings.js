import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('settingsAPI', {
  getApiKey: () => ipcRenderer.invoke('settings:getApiKey'),
  setApiKey: (key) => ipcRenderer.invoke('settings:setApiKey', key),
  openDebug: () => ipcRenderer.send('settings:openDebug')
});


