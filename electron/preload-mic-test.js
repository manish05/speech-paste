import { contextBridge, ipcRenderer } from 'electron';

console.log('Mic test preload script loaded successfully');
console.log('Setting up recorderAPI bridge...');

// Expose the same API as the recorder for compatibility with the debug UI
contextBridge.exposeInMainWorld('recorderAPI', {
  onStart: (callback) => ipcRenderer.on('recorder:start', callback),
  onStop: (callback) => ipcRenderer.on('recorder:stop', callback),
  onProcessing: (callback) => ipcRenderer.on('recorder:processing', callback),
  onTranscribed: (callback) => ipcRenderer.on('recorder:transcribed', callback),
  onError: (callback) => ipcRenderer.on('recorder:error', callback),
  sendAudio: (base64, mimeType) => ipcRenderer.send('recorder:audio', { base64, mimeType }),
  notifyStopped: () => ipcRenderer.send('recorder:stopped'),
  notifyTranscribed: (text) => ipcRenderer.send('recorder:transcribed-complete', text),
  test: () => 'Mic test preload script is working!'
});

console.log('recorderAPI bridge exposed successfully');

// Also expose the mic test API for future use
contextBridge.exposeInMainWorld('micTestAPI', {
  log: (message) => console.log(`[Mic Test] ${message}`)
});
