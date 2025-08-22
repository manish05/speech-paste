import { app, globalShortcut, session } from 'electron';
import keytar from 'keytar';
import { resolveAsset } from './config.js';

// Import modules
import { log } from './utils/logger.js';
import { buildTray, getTray } from './tray/index.js';
import { createRecorderWindow, destroyRecorderWindow } from './windows/recorder.js';
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
  
  // Force Chromium to skip device picker, auto-select default mic
  app.commandLine.appendSwitch("use-fake-ui-for-media-stream");
  log('Added use-fake-ui-for-media-stream switch to bypass Chromium UI dialogs', 'info');
  
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
  
  // Handle media permissions - bypass permission requests
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    if (permission === 'media') {
      // Only allow microphone (not camera)
      if (details.mediaTypes.includes('audio')) {
        log(`Auto-granting microphone permission to ${webContents.getURL()}`, 'info');
        callback(true);
        return;
      }
    }
    // Deny other permissions
    log(`Denying ${permission} permission to ${webContents.getURL()}`, 'info');
    callback(false);
  });

  // Auto-select microphone device so Chromium doesn't show device picker
  session.defaultSession.setDevicePermissionHandler((details) => {
    log(`Auto-trusting device: ${details.deviceType}`, 'info');
    return true; // trust all devices
  });

  // Additional check handler for more granular control
  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    // Grant audio capture permission automatically
    if (permission === 'media' && details.mediaTypes.includes('audio')) {
      log(`Checking microphone permission for ${requestingOrigin} - GRANTED`, 'info');
      return true;
    }
    // Deny other media permissions
    log(`Checking ${permission} permission for ${requestingOrigin} - DENIED`, 'info');
    return false;
  });
  
  // Request permissions first
  await requestPermissions();
  
  // Initialize components
  buildTray(startOrStopRecording, createSettingsWindow);
  // Don't create recorder window on startup - create it only when needed
  // createRecorderWindow();
  await registerGlobalShortcut();
  setupIpcHandlers();
  
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
  // Destroy recorder window to clean up resources
  destroyRecorderWindow();
});

// Prevent the app from quitting when all windows are closed
app.on('window-all-closed', (e) => {
  e.preventDefault();
});




