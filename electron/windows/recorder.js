import { BrowserWindow } from 'electron';
import fs from 'node:fs';
import { resolveAsset, WINDOW_CONFIG } from '../config.js';
import { log } from '../utils/logger.js';

/** @type {BrowserWindow | null} */
let recorderWindow = null;

/**
 * Creates the recorder window with consistent configuration
 * @returns {BrowserWindow} The created window
 */
export function createRecorderWindow() {
  // If window exists but is destroyed, recreate it
  if (recorderWindow && recorderWindow.isDestroyed()) {
    recorderWindow = null;
  }
  
  if (recorderWindow) return recorderWindow;
  
  const preloadPath = resolveAsset('electron/preload-recorder.js');
  log(`Loading recorder preload script from: ${preloadPath}`, 'info');
  log(`Preload script exists: ${fs.existsSync(preloadPath)}`, 'info');
  
  recorderWindow = new BrowserWindow({
    ...WINDOW_CONFIG.recorder,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    icon: resolveAsset('assets/icons/icon-256.png'),
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });
  
  recorderWindow.loadFile(resolveAsset('renderer/recorder.html'));
  
  recorderWindow.webContents.on('did-finish-load', () => {
    log('Recorder window loaded successfully');
    // Reset the renderer state when window is loaded
    recorderWindow.webContents.send('recorder:reset');
  });
  
  recorderWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Recorder window failed to load: ${errorCode} - ${errorDescription}`, 'error');
  });
  
  recorderWindow.on('closed', () => {
    recorderWindow = null;
  });
  
  return recorderWindow;
}

/**
 * Gets the current recorder window instance
 * @returns {BrowserWindow | null} The recorder window
 */
export function getRecorderWindow() {
  return recorderWindow;
}

/**
 * Closes the recorder window
 */
export function closeRecorderWindow() {
  if (recorderWindow) {
    recorderWindow.close();
  }
}
