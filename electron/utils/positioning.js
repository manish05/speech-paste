import { screen } from 'electron';
import { WINDOW_CONFIG } from '../config.js';

/**
 * Positions recorder window near the tray
 * @param {import('electron').BrowserWindow} win - Window to position
 * @param {import('electron').Tray} tray - Tray instance
 */
export function positionRecorderWindowNearTray(win, tray) {
  try {
    if (!tray) return;
    
    const trayBounds = tray.getBounds();
    const winBounds = win.getBounds();
    let x = Math.round(trayBounds.x + trayBounds.width / 2 - winBounds.width / 2);
    let y = process.platform === 'darwin'
      ? Math.max(0, trayBounds.y + trayBounds.height + 6)
      : Math.max(0, trayBounds.y - winBounds.height - 6);
    
    win.setPosition(x, y, false);
  } catch (error) {
    // Fallback: center
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    win.setPosition(Math.round((width - WINDOW_CONFIG.recorder.width) / 2), 20);
  }
}

/**
 * Positions settings window near the tray
 * @param {import('electron').BrowserWindow} win - Window to position
 * @param {import('electron').Tray} tray - Tray instance
 */
export function positionSettingsWindowNearTray(win, tray) {
  try {
    if (!tray) return;
    
    const trayBounds = tray.getBounds();
    const winBounds = win.getBounds();
    let x = Math.round(trayBounds.x + trayBounds.width / 2 - winBounds.width / 2);
    let y = process.platform === 'darwin'
      ? Math.max(20, trayBounds.y + trayBounds.height + 6)
      : Math.max(20, trayBounds.y - winBounds.height - 6);
    
    win.setPosition(x, y, false);
  } catch (error) {
    // Fallback: center with more top margin
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    win.setPosition(Math.round((width - WINDOW_CONFIG.settings.width) / 2), 40);
  }
}
