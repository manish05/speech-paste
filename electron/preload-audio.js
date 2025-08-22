import { contextBridge, ipcRenderer } from 'electron';

/**
 * Audio Recording API for renderer processes
 * Provides access to native audio recording capabilities
 */
const audioAPI = {
  /**
   * Start native audio recording
   * @param {Object} options - Recording options
   * @param {number} options.sampleRate - Sample rate in Hz (default: 44100)
   * @param {number} options.channels - Number of channels (default: 1)
   * @param {string} options.format - Audio format ('wav', 'raw') (default: 'wav')
   * @returns {Promise<Object>} - Success status
   */
  startRecording: (options = {}) => ipcRenderer.invoke('audio:startRecording', options),

  /**
   * Stop native audio recording
   * @returns {Promise<Object>} - Recording result with audio data
   */
  stopRecording: () => ipcRenderer.invoke('audio:stopRecording'),

  /**
   * Toggle recording state
   * @param {Object} options - Recording options
   * @returns {Promise<Object>} - Recording result
   */
  toggleRecording: (options = {}) => ipcRenderer.invoke('audio:toggleRecording', options),

  /**
   * Get current recording state
   * @returns {Promise<Object>} - Recording state
   */
  getRecordingState: () => ipcRenderer.invoke('audio:getRecordingState'),

  /**
   * Get stored audio data
   * @returns {Promise<Object>} - Audio data
   */
  getAudioData: () => ipcRenderer.invoke('audio:getAudioData'),

  /**
   * Set recording options
   * @param {Object} options - Recording options
   * @returns {Promise<Object>} - Success status
   */
  setRecordingOptions: (options) => ipcRenderer.invoke('audio:setRecordingOptions', options),

  /**
   * Get available audio recording commands
   * @returns {Promise<Object>} - Available commands
   */
  getAvailableCommands: () => ipcRenderer.invoke('audio:getAvailableCommands'),

  /**
   * Direct audio recorder access (for advanced usage)
   */
  direct: {
    /**
     * Start direct audio recording
     * @param {Object} options - Recording options
     * @returns {Promise<Object>} - Success status
     */
    start: (options = {}) => ipcRenderer.invoke('audio:directStart', options),

    /**
     * Stop direct audio recording
     * @returns {Promise<Object>} - Recording result
     */
    stop: () => ipcRenderer.invoke('audio:directStop'),

    /**
     * Get direct recording state
     * @returns {Promise<Object>} - Recording state
     */
    getState: () => ipcRenderer.invoke('audio:directGetState')
  },

  /**
   * Event listeners for audio recording events
   */
  on: {
    /**
     * Listen for recording started event
     * @param {Function} callback - Event callback
     */
    recordingStarted: (callback) => {
      ipcRenderer.on('recorder:start', callback);
    },

    /**
     * Listen for recording stopped event
     * @param {Function} callback - Event callback
     */
    recordingStopped: (callback) => {
      ipcRenderer.on('recorder:stop', callback);
    },

    /**
     * Listen for audio data ready event
     * @param {Function} callback - Event callback
     */
    audioDataReady: (callback) => {
      ipcRenderer.on('audio:dataReady', callback);
    },

    /**
     * Listen for recording error event
     * @param {Function} callback - Event callback
     */
    recordingError: (callback) => {
      ipcRenderer.on('audio:error', callback);
    }
  },

  /**
   * Remove event listeners
   */
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
};

/**
 * Expose audio recording API to renderer process
 */
contextBridge.exposeInMainWorld('audioRecording', audioAPI);

/**
 * Log that audio recording API is available
 */
console.log('Audio recording API exposed to renderer process');
console.log('audioRecording API methods:', Object.keys(audioAPI));
