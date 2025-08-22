import { contextBridge, ipcRenderer } from 'electron';

console.log('Notification preload script loaded successfully');

contextBridge.exposeInMainWorld('electronAPI', {
  onNotificationShow: (callback) => ipcRenderer.on('notification:show', (_event, text) => callback(text))
});
