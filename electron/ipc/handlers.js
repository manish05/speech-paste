import { ipcMain, clipboard } from 'electron';
import { log, showNotification } from '../utils/logger.js';
import { getApiKey, setApiKey } from '../services/keychain.js';
import { transcribeWithGemini } from '../services/transcription.js';
import { getRecorderWindow, closeRecorderWindow } from '../windows/recorder.js';
import { showNotification as showNotificationWindow } from '../windows/notification.js';
import { recordingStateManager } from '../recording/state-manager.js';

/**
 * Sets up all IPC handlers
 */
export function setupIpcHandlers() {
  // Settings handlers
  ipcMain.handle('settings:getApiKey', async () => {
    log('Getting API key from keychain...');
    const key = await getApiKey();
    log(`Retrieved key: ${key ? `${key.substring(0, 8)}...` : 'null'}`);
    return key || '';
  });

  ipcMain.handle('settings:setApiKey', async (_event, apiKey) => {
    log(`Attempting to save API key: ${apiKey ? `${apiKey.substring(0, 8)}...` : 'empty'}`);
    const ok = await setApiKey(apiKey);
    log(`API key save result: ${ok}`);
    return ok;
  });

  // Recorder handlers
  ipcMain.on('recorder:audio', async (_event, payload) => {
    try {
      const { base64, mimeType } = payload;
      log(`Received audio for transcription: ${base64.length} chars, mimeType: ${mimeType}`, 'info');
      
      const recorderWindow = getRecorderWindow();
      recorderWindow?.webContents.send('recorder:processing');
      
      const text = await transcribeWithGemini(base64, mimeType);
      log(`Transcription result: "${text}"`, 'info');
      
      // Send the transcribed text back to the renderer
      if (recorderWindow) {
        log('Sending transcribed text to renderer...', 'info');
        recorderWindow.webContents.send('recorder:transcribed', text);
        log('Transcribed text sent to renderer', 'info');
      } else {
        log('Recorder window not found, cannot send transcribed text', 'error');
      }
    } catch (error) {
      log(`Transcription error: ${error.message}`, 'error');
      log(`Error details: ${JSON.stringify(error, null, 2)}`, 'error');
      
      // Extract more detailed error information
      let errorMessage = String(error?.message || error);
      
      // If it's a Gemini API error, try to extract more details
      if (error.response) {
        try {
          const errorData = await error.response.json();
          errorMessage = `Gemini API Error: ${errorData.error?.message || errorData.message || errorMessage}`;
          log(`Gemini API error details: ${JSON.stringify(errorData, null, 2)}`, 'error');
        } catch (parseError) {
          log(`Failed to parse error response: ${parseError.message}`, 'error');
        }
      }
      
      const recorderWindow = getRecorderWindow();
      recorderWindow?.webContents.send('recorder:error', errorMessage);
    }
  });

  ipcMain.on('recorder:stopped', () => {
    // Stop recording via centralized state manager
    recordingStateManager.stopRecording();
  });

  ipcMain.on('recorder:transcribed-complete', (_event, text) => {
    log('Transcription completed, showing notification and closing windows', 'info');
    
    // Stop recording via centralized state manager
    recordingStateManager.stopRecording();
    
    // Show notification with the transcribed text
    showNotificationWindow(text);
    
    // Close the recorder window
    setTimeout(() => {
      closeRecorderWindow();
    }, 500);
  });

  // Debug window handler
  ipcMain.on('settings:openDebug', () => {
    log('Opening debug window...', 'info');
    const { createMicTestWindow } = require('../windows/mic-test.js');
    createMicTestWindow();
  });
}
