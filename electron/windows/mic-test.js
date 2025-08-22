import { BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAsset, WINDOW_CONFIG } from '../config.js';
import { log } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {BrowserWindow | null} */
let micTestWindow = null;

/**
 * Creates the microphone test window
 * @returns {Promise<BrowserWindow>} The created window
 */
export async function createMicTestWindow() {
  if (micTestWindow) {
    micTestWindow.focus();
    return micTestWindow;
  }
  
  const preloadPath = resolveAsset('electron/preload-audio.js');
  log(`Loading audio recording preload script from: ${preloadPath}`, 'info');
  
  // Check if preload script exists
  const fs = await import('node:fs');
  log(`Preload script exists: ${fs.existsSync(preloadPath)}`, 'info');
  
  micTestWindow = new BrowserWindow({
    width: 900,
    height: 700,
    show: false,
    frame: true,
    resizable: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    icon: resolveAsset('assets/icons/icon-256.png'),
    title: 'Microphone Test',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      autoplayPolicy: 'no-user-gesture-required'
    }
  });
  
  micTestWindow.loadFile(resolveAsset('renderer/mic-test.html'));
  
  micTestWindow.once('ready-to-show', () => {
    micTestWindow.show();
    log('Microphone test window opened');
  });
  
  micTestWindow.on('closed', () => {
    micTestWindow = null;
    log('Microphone test window closed');
  });
  
  return micTestWindow;
}

/**
 * Gets the current microphone test window instance
 * @returns {BrowserWindow | null} The microphone test window
 */
export function getMicTestWindow() {
  return micTestWindow;
}

/**
 * Closes the microphone test window
 */
export function closeMicTestWindow() {
  if (micTestWindow) {
    micTestWindow.close();
  }
}
