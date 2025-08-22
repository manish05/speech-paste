import { BrowserWindow } from 'electron';
import fs from 'node:fs';
import { resolveAsset, WINDOW_CONFIG } from '../config.js';
import { log } from '../utils/logger.js';
import { positionSettingsWindowNearTray } from '../utils/positioning.js';
import { getTray } from '../tray/index.js';

/** @type {BrowserWindow | null} */
let settingsWindow = null;

/**
 * Creates the settings window with consistent configuration
 * @returns {BrowserWindow} The created window
 */
export function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
    return settingsWindow;
  }
  
  settingsWindow = new BrowserWindow({
    ...WINDOW_CONFIG.settings,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    minWidth: 400,
    minHeight: 400,
    alwaysOnTop: true,
    skipTaskbar: true,
    icon: resolveAsset('assets/icons/icon-256.png'),
    webPreferences: {
      preload: resolveAsset('electron/preload-settings.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });
  
  const preloadPath = resolveAsset('electron/preload-settings.js');
  log(`Loading settings preload script from: ${preloadPath}`);
  log(`Preload script exists: ${fs.existsSync(preloadPath)}`);
  
  settingsWindow.loadFile(resolveAsset('renderer/settings.html'));
  
  settingsWindow.webContents.on('did-finish-load', () => {
    log('Settings window loaded successfully');
  });
  
  settingsWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Settings window failed to load: ${errorCode} - ${errorDescription}`, 'error');
  });
  
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
  
  positionSettingsWindowNearTray(settingsWindow, getTray());
  settingsWindow.show();
  settingsWindow.focus();
  
  return settingsWindow;
}

/**
 * Gets the current settings window instance
 * @returns {BrowserWindow | null} The settings window
 */
export function getSettingsWindow() {
  return settingsWindow;
}

/**
 * Closes the settings window
 */
export function closeSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.close();
  }
}
