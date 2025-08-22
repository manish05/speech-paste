import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script loaded successfully');

contextBridge.exposeInMainWorld('recorderAPI', {
  onStart: (callback) => ipcRenderer.on('recorder:start', callback),
  onStop: (callback) => ipcRenderer.on('recorder:stop', callback),
  onReset: (callback) => ipcRenderer.on('recorder:reset', callback),
  onProcessing: (callback) => ipcRenderer.on('recorder:processing', callback),
  onTranscribed: (callback) => ipcRenderer.on('recorder:transcribed', callback),
  onError: (callback) => ipcRenderer.on('recorder:error', callback),
  sendAudio: (base64, mimeType) => ipcRenderer.send('recorder:audio', { base64, mimeType }),
  notifyStopped: () => ipcRenderer.send('recorder:stopped'),
  notifyTranscribed: (text) => ipcRenderer.send('recorder:transcribed-complete', text),
  stopRecording: () => ipcRenderer.send('recorder:stopped'),
  closeWindow: () => ipcRenderer.send('recorder:close'),
  copyToClipboard: (text) => {
    console.log('Preload: copyToClipboard called with text:', text);
    return ipcRenderer.invoke('clipboard:writeText', text);
  },
  test: () => 'Preload script is working!'
});

console.log('recorderAPI exposed with clipboard support');

// Forward processing lifecycle events to the renderer page as postMessage
ipcRenderer.on('recorder:processing', () => {
  window.postMessage({ type: 'processing' }, '*');
});
ipcRenderer.on('recorder:transcribed', (_evt, text) => {
  console.log('Preload: Received transcribed event with text:', text);
  window.postMessage({ type: 'transcribed', text }, '*');
});
ipcRenderer.on('recorder:error', (_evt, message) => {
  window.postMessage({ type: 'error', message }, '*');
});


