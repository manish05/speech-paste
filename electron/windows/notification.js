import { BrowserWindow, screen } from 'electron';
import fs from 'node:fs';
import { resolveAsset, WINDOW_CONFIG } from '../config.js';
import { log } from '../utils/logger.js';

/** @type {BrowserWindow | null} */
let notificationWindow = null;

/**
 * Creates the notification window
 * @returns {BrowserWindow} The created window
 */
export function createNotificationWindow() {
  if (notificationWindow) {
    notificationWindow.close();
  }
  
  const preloadPath = resolveAsset('electron/preload-notification.js');
  log(`Loading notification preload script from: ${preloadPath}`, 'info');
  
  notificationWindow = new BrowserWindow({
    width: 400,
    height: 200,
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
  
  notificationWindow.loadFile(resolveAsset('renderer/notification.html'));
  
  notificationWindow.webContents.on('did-finish-load', () => {
    log('Notification window loaded successfully');
  });
  
  notificationWindow.on('closed', () => {
    notificationWindow = null;
  });
  
  return notificationWindow;
}

/**
 * Gets the current notification window instance
 * @returns {BrowserWindow | null} The notification window
 */
export function getNotificationWindow() {
  return notificationWindow;
}

/**
 * Shows notification with text
 * @param {string} text - The text to display
 */
export function showNotification(text) {
  if (!notificationWindow) {
    createNotificationWindow();
  }
  
  // Position the notification in the top-right corner
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  notificationWindow.setPosition(width - 420, 20);
  notificationWindow.show();
  
  // Wait for window to be ready before sending message
  setTimeout(() => {
    // Send the text to the renderer
    log(`Sending notification text: "${text}" (type: ${typeof text})`, 'info');
    notificationWindow.webContents.send('notification:show', text);
  }, 100);
  
  // Auto-close after 3 seconds
  setTimeout(() => {
    if (notificationWindow) {
      notificationWindow.close();
    }
  }, 3000);
}

/**
 * Closes the notification window
 */
export function closeNotificationWindow() {
  if (notificationWindow) {
    notificationWindow.close();
  }
}
