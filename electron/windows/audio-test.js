import { BrowserWindow } from 'electron';
import { resolveAsset } from '../config.js';
import { log } from '../utils/logger.js';

let audioTestWindow = null;

/**
 * Creates the audio test window
 * @returns {BrowserWindow} - The created window
 */
export function createAudioTestWindow() {
  if (audioTestWindow && !audioTestWindow.isDestroyed()) {
    audioTestWindow.focus();
    return audioTestWindow;
  }

  log('Creating audio test window...', 'info');

  audioTestWindow = new BrowserWindow({
    width: 900,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Audio Recording Test',
    icon: resolveAsset('assets/icons/icon-256.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: resolveAsset('electron/preload-audio.js')
    },
    show: false,
    resizable: true,
    maximizable: true,
    minimizable: true,
    closable: true,
    skipTaskbar: false,
    autoHideMenuBar: true
  });

  // Load the audio test page
  const audioTestPath = resolveAsset('renderer/audio-test.html');
  log(`Loading audio test page: ${audioTestPath}`, 'info');
  audioTestWindow.loadFile(audioTestPath);

  // Show window when ready
  audioTestWindow.once('ready-to-show', () => {
    log('Audio test window ready to show', 'info');
    audioTestWindow.show();
  });

  // Handle window closed
  audioTestWindow.on('closed', () => {
    log('Audio test window closed', 'info');
    audioTestWindow = null;
  });

  // Handle window close
  audioTestWindow.on('close', () => {
    log('Audio test window closing', 'info');
  });

  // Handle errors
  audioTestWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Audio test window failed to load: ${errorDescription} (${errorCode})`, 'error');
  });

  return audioTestWindow;
}

/**
 * Gets the audio test window
 * @returns {BrowserWindow|null} - The audio test window or null if not exists
 */
export function getAudioTestWindow() {
  return audioTestWindow;
}

/**
 * Shows the audio test window
 */
export function showAudioTestWindow() {
  if (audioTestWindow && !audioTestWindow.isDestroyed()) {
    if (audioTestWindow.isMinimized()) {
      audioTestWindow.restore();
    }
    audioTestWindow.show();
    audioTestWindow.focus();
  } else {
    createAudioTestWindow();
  }
}

/**
 * Closes the audio test window
 */
export function closeAudioTestWindow() {
  if (audioTestWindow && !audioTestWindow.isDestroyed()) {
    audioTestWindow.close();
  }
}

/**
 * Destroys the audio test window
 */
export function destroyAudioTestWindow() {
  if (audioTestWindow && !audioTestWindow.isDestroyed()) {
    audioTestWindow.destroy();
  }
  audioTestWindow = null;
}
