import { app, globalShortcut } from 'electron';
import keytar from 'keytar';
import { resolveAsset } from './config.js';

// Import modules
import { log } from './utils/logger.js';
import { buildTray, getTray } from './tray/index.js';
import { createRecorderWindow } from './windows/recorder.js';
import { createSettingsWindow } from './windows/settings.js';
import { createMicTestWindow } from './windows/mic-test.js';
import { registerGlobalShortcut, startOrStopRecording } from './recording/index.js';
import { recordingStateManager } from './recording/state-manager.js';
import { setupIpcHandlers } from './ipc/handlers.js';
import { requestPermissions } from './permissions/index.js';

// ============================================================================
// APP LIFECYCLE
// ============================================================================

/**
 * Initializes the application
 */
async function initializeApp() {
  log('App ready, checking keytar availability...');
  log(`Keytar available: ${!!keytar}`);
  log(`Platform: ${process.platform}`);
  
  // Set app icon
  const iconPath = resolveAsset('assets/icons/icon-256.png');
  log(`Setting app icon: ${iconPath}`);
  app.setAppUserModelId('com.speechpaste.app');
  
  // Test keytar functionality
  try {
    const testKey = await keytar.getPassword('test', 'test');
    log(`Keytar test successful, test key: ${testKey}`);
  } catch (error) {
    log(`Keytar test failed: ${error.message}`, 'error');
  }
  
  // Initialize components
  buildTray(startOrStopRecording, createSettingsWindow);
  createRecorderWindow();
  await registerGlobalShortcut();
  setupIpcHandlers();
  await requestPermissions();
  
  // Hide dock on macOS
  app.dock?.hide?.();
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

app.on('ready', initializeApp);

app.on('will-quit', () => {
  // Force stop any ongoing recording
  recordingStateManager.forceStop();
  globalShortcut.unregisterAll();
});

// Prevent the app from quitting when all windows are closed
app.on('window-all-closed', (e) => {
  e.preventDefault();
});




