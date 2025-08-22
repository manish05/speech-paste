import { EventEmitter } from 'events';
import { log } from '../utils/logger.js';
import { setTrayStateRecording } from '../tray/index.js';
import { getRecorderWindow } from '../windows/recorder.js';

class RecordingStateManager extends EventEmitter {
  constructor() {
    super();
    this.isRecording = false;
    this.recordingStartTime = null;
  }

  /**
   * Starts recording and notifies all components
   */
  startRecording() {
    if (this.isRecording) {
      log('Recording already in progress, ignoring start request', 'warn');
      return;
    }

    log('Starting recording via state manager', 'info');
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    
    // Update tray state
    setTrayStateRecording(true);
    
    // Notify recorder window
    const recorderWindow = getRecorderWindow();
    if (recorderWindow && !recorderWindow.isDestroyed()) {
      // Check if window is ready to receive messages
      if (recorderWindow.webContents.isLoading()) {
        log('Recorder window still loading, waiting...', 'info');
        recorderWindow.webContents.once('did-finish-load', () => {
          recorderWindow.webContents.send('recorder:start');
        });
      } else {
        recorderWindow.webContents.send('recorder:start');
      }
    } else {
      log('Recorder window not available or destroyed', 'warn');
    }
    
    // Emit event for other listeners
    this.emit('recordingStarted');
    
    log('Recording started successfully', 'info');
  }

  /**
   * Stops recording and notifies all components
   */
  stopRecording() {
    if (!this.isRecording) {
      log('No recording in progress, ignoring stop request', 'warn');
      return;
    }

    log('Stopping recording via state manager', 'info');
    this.isRecording = false;
    const recordingDuration = this.recordingStartTime ? Date.now() - this.recordingStartTime : 0;
    this.recordingStartTime = null;
    
    // Update tray state
    setTrayStateRecording(false);
    
    // Notify recorder window
    const recorderWindow = getRecorderWindow();
    if (recorderWindow && !recorderWindow.isDestroyed()) {
      recorderWindow.webContents.send('recorder:stop');
    } else {
      log('Recorder window not available or destroyed', 'warn');
    }
    
    // Emit event for other listeners
    this.emit('recordingStopped', { duration: recordingDuration });
    
    log(`Recording stopped successfully (duration: ${recordingDuration}ms)`, 'info');
  }

  /**
   * Toggles recording state
   */
  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  /**
   * Gets current recording state
   */
  getRecordingState() {
    return {
      isRecording: this.isRecording,
      startTime: this.recordingStartTime,
      duration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0
    };
  }

  /**
   * Checks if currently recording
   */
  isCurrentlyRecording() {
    return this.isRecording;
  }

  /**
   * Force stop recording (for cleanup)
   */
  forceStop() {
    if (this.isRecording) {
      log('Force stopping recording', 'warn');
      this.stopRecording();
    }
  }
}

// Export singleton instance
export const recordingStateManager = new RecordingStateManager();
