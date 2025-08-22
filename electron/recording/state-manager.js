import { EventEmitter } from 'events';
import { log } from '../utils/logger.js';
import { setTrayStateRecording } from '../tray/index.js';
import { getRecorderWindow } from '../windows/recorder.js';
import { audioRecorder } from '../services/audio-recorder.js';

class RecordingStateManager extends EventEmitter {
  constructor() {
    super();
    this.isRecording = false;
    this.recordingStartTime = null;
    this.audioData = null;
    this.recordingOptions = {
      sampleRate: 44100,
      channels: 1,
      format: 'wav'
    };
    
    // Listen to audio recorder events
    audioRecorder.on('recordingStarted', () => {
      log('Audio recorder started', 'info');
    });
    
    audioRecorder.on('recordingStopped', (result) => {
      log('Audio recorder stopped', 'info');
      this.audioData = result;
      this.emit('audioDataReady', result);
    });
    
    audioRecorder.on('recordingError', (error) => {
      log(`Audio recorder error: ${error.message}`, 'error');
      this.emit('recordingError', error);
    });
  }

  /**
   * Starts recording and notifies all components
   * @param {Object} options - Recording options
   */
  async startRecording(options = {}) {
    if (this.isRecording) {
      log('Recording already in progress, ignoring start request', 'warn');
      return false;
    }

    // Merge options with defaults
    this.recordingOptions = { ...this.recordingOptions, ...options };

    log('Starting recording via state manager', 'info');
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.audioData = null;
    
    // WIP: Native audio recording is not fully functional yet
    // For now, we'll skip native recording and use browser-based recording
    log('WIP: Native audio recording disabled - using browser-based recording', 'warn');
    let audioSuccess = false;
    
    // TODO: Re-enable native audio recording once issues are resolved
    // try {
    //   audioSuccess = await audioRecorder.startRecording(this.recordingOptions);
    //   if (!audioSuccess) {
    //     log('Native audio recording failed, will use browser-based recording', 'warn');
    //   }
    // } catch (error) {
    //   log(`Native audio recording error: ${error.message}, will use browser-based recording`, 'warn');
    // }
    
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
    return true;
  }

  /**
   * Stops recording and notifies all components
   */
  async stopRecording() {
    if (!this.isRecording) {
      log('No recording in progress, ignoring stop request', 'warn');
      return null;
    }

    log('Stopping recording via state manager', 'info');
    this.isRecording = false;
    const recordingDuration = this.recordingStartTime ? Date.now() - this.recordingStartTime : 0;
    this.recordingStartTime = null;
    
    // WIP: Native audio recording is not fully functional yet
    // For now, we'll skip native recording stop
    log('WIP: Native audio recording stop disabled', 'warn');
    const audioResult = null;
    
    // TODO: Re-enable native audio recording stop once issues are resolved
    // const audioResult = await audioRecorder.stopRecording();
    
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
    this.emit('recordingStopped', { 
      duration: recordingDuration,
      audioData: audioResult
    });
    
    log(`Recording stopped successfully (duration: ${recordingDuration}ms)`, 'info');
    return audioResult;
  }

  /**
   * Toggles recording state
   * @param {Object} options - Recording options
   */
  async toggleRecording(options = {}) {
    if (this.isRecording) {
      return await this.stopRecording();
    } else {
      return await this.startRecording(options);
    }
  }

  /**
   * Gets current recording state
   */
  getRecordingState() {
    return {
      isRecording: this.isRecording,
      startTime: this.recordingStartTime,
      duration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0,
      audioData: this.audioData,
      options: this.recordingOptions
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
  async forceStop() {
    if (this.isRecording) {
      log('Force stopping recording', 'warn');
      await this.stopRecording();
    }
  }

  /**
   * Gets stored audio data
   * @returns {Object|null} - Audio data or null if not available
   */
  getAudioData() {
    return this.audioData;
  }

  /**
   * Sets recording options
   * @param {Object} options - Recording options
   */
  setRecordingOptions(options) {
    this.recordingOptions = { ...this.recordingOptions, ...options };
    log(`Updated recording options: ${JSON.stringify(this.recordingOptions)}`, 'info');
  }

  /**
   * Gets available audio recording commands
   * @returns {Promise<Object>} - Available commands
   */
  async getAvailableCommands() {
    return await audioRecorder.getAvailableCommands();
  }
}

// Export singleton instance
export const recordingStateManager = new RecordingStateManager();
