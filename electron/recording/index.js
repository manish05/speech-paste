import { globalShortcut } from 'electron';
import { GLOBAL_SHORTCUT } from '../config.js';
import { log } from '../utils/logger.js';
import { getApiKey } from '../services/keychain.js';
import { createRecorderWindow, getRecorderWindow, showRecorderWindow } from '../windows/recorder.js';
import { createSettingsWindow } from '../windows/settings.js';
import { getTray } from '../tray/index.js';
import { positionRecorderWindowNearTray } from '../utils/positioning.js';
import { showNotification } from '../utils/logger.js';
import { recordingStateManager } from './state-manager.js';
import { systemPreferences } from 'electron';

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
    await stopRecording();
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
  
  // Check system microphone permission on macOS
  if (process.platform === 'darwin') {
    const status = systemPreferences.getMediaAccessStatus('microphone');
    log(`Microphone access status: ${status}`, 'info');
    
    if (status !== 'granted') {
      const granted = await systemPreferences.askForMediaAccess('microphone');
      log(`Microphone access granted: ${granted}`, 'info');
      
      if (!granted) {
        showNotification('Microphone Access Required', 
          'Please grant microphone access in System Preferences > Security & Privacy > Microphone');
        return;
      }
    }
  }
  
  // Check for API key before starting recording
  const apiKey = await getApiKey();
  if (!apiKey) {
    showNotification('Speak Paste', 'No API key found. Opening settings...');
    createSettingsWindow();
    return;
  }
  
  // Get existing window or create new one
  let win = getRecorderWindow();
  if (!win || win.isDestroyed()) {
    log('Creating new recorder window for first use', 'info');
    win = createRecorderWindow();
  }
  
  // Position and show the window
  positionRecorderWindowNearTray(win, getTray());
  showRecorderWindow();
  
  // Start recording immediately without delays
  const success = await recordingStateManager.startRecording();
  if (success) {
    console.log('Recording started');
  } else {
    console.log('Failed to start recording');
  }
}

/**
 * Stops recording process
 */
export async function stopRecording() {
  console.log(`stopRecording called - current isRecording: ${recordingStateManager.isCurrentlyRecording()}`);
  
  // Use centralized state manager to stop recording
  const result = await recordingStateManager.stopRecording();
  console.log('Recording stopped', result ? 'with audio data' : 'without audio data');
  return result;
}

/**
 * Gets the current recording state
 * @returns {Object} Recording state object
 */
export function getRecordingState() {
  return recordingStateManager.getRecordingState();
}
