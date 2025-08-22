import { ipcMain, clipboard } from 'electron';
import { log, showNotification } from '../utils/logger.js';
import { getApiKey, setApiKey } from '../services/keychain.js';
import { transcribeWithGemini } from '../services/transcription.js';
import { getRecorderWindow, closeRecorderWindow } from '../windows/recorder.js';
import { getMicTestWindow } from '../windows/mic-test.js';
import { showNotification as showNotificationWindow } from '../windows/notification.js';
import { recordingStateManager } from '../recording/state-manager.js';
import { createMicTestWindow } from '../windows/mic-test.js';

/**
 * Sets up all IPC handlers
 */
export function setupIpcHandlers() {
  log('Setting up IPC handlers...', 'info');
  
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
      
      // Get both windows
      const recorderWindow = getRecorderWindow();
      const micTestWindow = getMicTestWindow();
      
      // Send processing state to both windows
      recorderWindow?.webContents.send('recorder:processing');
      micTestWindow?.webContents.send('recorder:processing');
      
      const text = await transcribeWithGemini(base64, mimeType);
      log(`Transcription result: "${text}"`, 'info');
      
      // Send the transcribed text back to both windows
      if (recorderWindow) {
        log('Sending transcribed text to recorder window...', 'info');
        recorderWindow.webContents.send('recorder:transcribed', text);
        log('Transcribed text sent to recorder window', 'info');
      }
      
      if (micTestWindow) {
        log('Sending transcribed text to mic test window...', 'info');
        micTestWindow.webContents.send('recorder:transcribed', text);
        log('Transcribed text sent to mic test window', 'info');
      }
      
      if (!recorderWindow && !micTestWindow) {
        log('No windows found to send transcribed text', 'error');
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
      
      // Send error to both windows
      const recorderWindow = getRecorderWindow();
      const micTestWindow = getMicTestWindow();
      recorderWindow?.webContents.send('recorder:error', errorMessage);
      micTestWindow?.webContents.send('recorder:error', errorMessage);
    }
  });

  // Clipboard handler
  ipcMain.handle('clipboard:writeText', async (_event, text) => {
    try {
      clipboard.writeText(text);
      log(`Text copied to clipboard: "${text}"`, 'info');
      return { success: true };
    } catch (error) {
      log(`Failed to copy text to clipboard: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  });
  
  log('Clipboard handler registered successfully', 'info');

  ipcMain.on('recorder:stopped', () => {
    // Stop recording via centralized state manager
    recordingStateManager.stopRecording();
  });

  ipcMain.on('recorder:close', () => {
    log('Closing recorder window via IPC', 'info');
    closeRecorderWindow();
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
  ipcMain.on('settings:openDebug', async () => {
    log('Opening debug window...', 'info');
    await createMicTestWindow();
  });
}
