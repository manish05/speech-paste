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
  
  // Return existing window if it exists
  if (recorderWindow) {
    log('Reusing existing recorder window', 'info');
    return recorderWindow;
  }
  
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
      // Note: permissions array is not a valid webPreferences option
    }
  });
  
  // Set up permission handling
  recorderWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    log(`Permission request: ${permission}`, 'info');
    
    if (permission === 'microphone' || permission === 'media') {
      // Always allow microphone/media access since we already have system-level permission
      log(`Allowing ${permission} access`, 'info');
      callback(true);
    } else {
      // Deny other permissions
      log(`Denying permission: ${permission}`, 'info');
      callback(false);
    }
  });

  // Add permission check handler to always return true for microphone
  recorderWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    if (permission === 'microphone' || permission === 'media') {
      // Don't log permission checks as they happen frequently
      // log(`Permission check for ${permission}: granting`, 'info');
      return true;
    }
    return false;
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
 * Shows the recorder window
 */
export function showRecorderWindow() {
  if (recorderWindow && !recorderWindow.isDestroyed()) {
    recorderWindow.showInactive();
    log('Showing recorder window', 'info');
  }
}

/**
 * Hides the recorder window
 */
export function hideRecorderWindow() {
  if (recorderWindow && !recorderWindow.isDestroyed()) {
    recorderWindow.hide();
    log('Hiding recorder window', 'info');
  }
}

/**
 * Closes the recorder window
 */
export function closeRecorderWindow() {
  if (recorderWindow) {
    // Instead of closing, just hide the window to preserve permissions
    recorderWindow.hide();
    log('Hiding recorder window (preserving for reuse)', 'info');
  }
}

/**
 * Destroys the recorder window completely
 */
export function destroyRecorderWindow() {
  if (recorderWindow && !recorderWindow.isDestroyed()) {
    // Send release command to clean up microphone stream
    recorderWindow.webContents.send('recorder:release');
    // Close immediately without delay
    recorderWindow.close();
    recorderWindow = null;
    log('Destroyed recorder window', 'info');
  }
}
