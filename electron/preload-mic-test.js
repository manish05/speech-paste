import { contextBridge } from 'electron';

// Minimal preload script for microphone test window
// No audio processing functionality needed
contextBridge.exposeInMainWorld('micTestAPI', {
  // Add any future functionality here if needed
  log: (message) => console.log(`[Mic Test] ${message}`)
});
