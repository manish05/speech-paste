import { globalShortcut } from 'electron';
import { GLOBAL_SHORTCUT } from '../config.js';
import { log } from '../utils/logger.js';
import { getApiKey } from '../services/keychain.js';
import { createRecorderWindow, getRecorderWindow } from '../windows/recorder.js';
import { createSettingsWindow } from '../windows/settings.js';
import { getTray } from '../tray/index.js';
import { positionRecorderWindowNearTray } from '../utils/positioning.js';
import { showNotification } from '../utils/logger.js';
import { recordingStateManager } from './state-manager.js';

/**
 * Registers global shortcuts
 */
export async function registerGlobalShortcut() {
  // Register recording shortcut
  globalShortcut.unregister(GLOBAL_SHORTCUT);
  const recordingOk = globalShortcut.register(GLOBAL_SHORTCUT, () => {
    startOrStopRecording();
  });
  
  if (!recordingOk) {
    log('Failed to register recording global shortcut', 'error');
  }
}

/**
 * Toggles recording state
 */
export async function startOrStopRecording() {
  console.log(`startOrStopRecording called - current isRecording: ${recordingStateManager.isCurrentlyRecording()}`);
  if (recordingStateManager.isCurrentlyRecording()) {
    stopRecording();
  } else {
    await startRecording();
  }
}

/**
 * Starts recording process
 */
export async function startRecording() {
  console.log(`startRecording called - current isRecording: ${recordingStateManager.isCurrentlyRecording()}`);
  if (recordingStateManager.isCurrentlyRecording()) return;
  
  // Check for API key before starting recording
  const apiKey = await getApiKey();
  if (!apiKey) {
    showNotification('Speak Paste', 'No API key found. Opening settings...');
    createSettingsWindow();
    return;
  }
  
  const win = createRecorderWindow();
  positionRecorderWindowNearTray(win, getTray());
  win.showInactive();
  
  // Wait for window to be ready before starting recording
  setTimeout(() => {
    // Use centralized state manager to start recording
    recordingStateManager.startRecording();
    console.log('Recording started');
  }, 200);
}

/**
 * Stops recording process
 */
export function stopRecording() {
  console.log(`stopRecording called - current isRecording: ${recordingStateManager.isCurrentlyRecording()}`);
  
  // Use centralized state manager to stop recording
  recordingStateManager.stopRecording();
  console.log('Recording stopped');
}

/**
 * Gets the current recording state
 * @returns {Object} Recording state object
 */
export function getRecordingState() {
  return recordingStateManager.getRecordingState();
}
