import { EventEmitter } from 'events';
import { log } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

/**
 * Native Audio Recorder Service
 * Handles audio recording using Node.js native capabilities
 * 
 * WIP: This is a work in progress. The native audio recording system
 * is not fully functional yet. Issues include:
 * - ENOENT errors when system commands (sox, ffmpeg, arecord) are not available
 * - Integration with the main recording flow needs refinement
 * - Fallback to browser-based recording when native recording fails
 * 
 * TODO: 
 * - Fix command availability checking
 * - Implement proper fallback mechanism
 * - Test on different platforms
 * - Integrate with existing recording workflow
 */
class AudioRecorder extends EventEmitter {
  constructor() {
    super();
    this.isRecording = false;
    this.recordingStartTime = null;
    this.audioData = [];
    this.recordingPath = null;
    this.writeStream = null;
    this.audioProcess = null;
  }

  /**
   * Starts audio recording
   * @param {Object} options - Recording options
   * @param {number} options.sampleRate - Sample rate in Hz (default: 44100)
   * @param {number} options.channels - Number of channels (default: 1)
   * @param {string} options.format - Audio format ('wav', 'raw') (default: 'wav')
   * @returns {Promise<boolean>} - Success status
   */
  async startRecording(options = {}) {
    if (this.isRecording) {
      log('Audio recording already in progress', 'warn');
      return false;
    }

    try {
      const {
        sampleRate = 44100,
        channels = 1,
        format = 'wav'
      } = options;

      log(`Starting native audio recording: ${sampleRate}Hz, ${channels}ch, ${format}`, 'info');

      // Reset state
      this.audioData = [];
      this.recordingStartTime = Date.now();
      this.isRecording = true;

      // Create temporary file path
      const timestamp = Date.now();
      const tempDir = app.getPath('temp');
      this.recordingPath = path.join(tempDir, `speech-paste-recording-${timestamp}.${format}`);

      // Start recording using system audio capture
      const success = await this.startSystemRecording(sampleRate, channels, format);
      
      if (success) {
        this.emit('recordingStarted');
        log('Native audio recording started successfully', 'info');
        return true;
      } else {
        this.isRecording = false;
        return false;
      }

    } catch (error) {
      log(`Failed to start audio recording: ${error.message}`, 'error');
      this.isRecording = false;
      this.emit('recordingError', error);
      return false;
    }
  }

  /**
   * Starts system audio recording using native commands
   * @param {number} sampleRate - Sample rate
   * @param {number} channels - Number of channels
   * @param {string} format - Audio format
   * @returns {Promise<boolean>} - Success status
   */
  async startSystemRecording(sampleRate, channels, format) {
    try {
      const { spawn } = await import('child_process');
      
      // Check available commands first
      const availableCommands = await this.getAvailableCommands();
      log(`Available commands: ${JSON.stringify(availableCommands)}`, 'info');
      
      // If no commands are available, return false immediately
      const hasAnyCommand = Object.values(availableCommands).some(available => available);
      if (!hasAnyCommand) {
        log('No audio recording commands available on this system', 'warn');
        return false;
      }
      
      // Use different recording methods based on platform
      if (process.platform === 'darwin') {
        // macOS: Use sox or ffmpeg
        return await this.startMacRecording(sampleRate, channels, format, availableCommands);
      } else if (process.platform === 'win32') {
        // Windows: Use ffmpeg
        return await this.startWindowsRecording(sampleRate, channels, format, availableCommands);
      } else if (process.platform === 'linux') {
        // Linux: Use arecord or ffmpeg
        return await this.startLinuxRecording(sampleRate, channels, format, availableCommands);
      } else {
        log(`Unsupported platform: ${process.platform}`, 'error');
        return false;
      }
    } catch (error) {
      log(`Failed to start system recording: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Starts recording on macOS
   * @param {number} sampleRate - Sample rate
   * @param {number} channels - Number of channels
   * @param {string} format - Audio format
   * @param {Object} availableCommands - Available commands
   * @returns {Promise<boolean>} - Success status
   */
  async startMacRecording(sampleRate, channels, format, availableCommands) {
    try {
      const { spawn } = await import('child_process');
      
      // Try sox first, then ffmpeg
      const commands = [
        {
          cmd: 'sox',
          available: availableCommands.sox,
          args: [
            '-d', // Default input device
            '-r', sampleRate.toString(),
            '-c', channels.toString(),
            '-b', '16',
            this.recordingPath,
            'trim', '0', '999999' // Record for a long time, we'll stop it manually
          ]
        },
        {
          cmd: 'ffmpeg',
          available: availableCommands.ffmpeg,
          args: [
            '-f', 'avfoundation',
            '-i', ':0', // Audio input device
            '-ar', sampleRate.toString(),
            '-ac', channels.toString(),
            '-acodec', 'pcm_s16le',
            '-y', // Overwrite output file
            this.recordingPath
          ]
        }
      ];

      for (const command of commands) {
        if (!command.available) {
          log(`${command.cmd} not available, skipping...`, 'warn');
          continue;
        }

        try {
          log(`Trying ${command.cmd} for audio recording...`, 'info');
          
          this.audioProcess = spawn(command.cmd, command.args, {
            stdio: ['ignore', 'pipe', 'pipe']
          });

          this.audioProcess.on('error', (error) => {
            log(`${command.cmd} error: ${error.message}`, 'error');
          });

          this.audioProcess.on('exit', (code) => {
            if (code !== 0) {
              log(`${command.cmd} exited with code ${code}`, 'warn');
            }
          });

          // Wait a bit to see if the process starts successfully
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (this.audioProcess.pid) {
            log(`Successfully started ${command.cmd} recording (PID: ${this.audioProcess.pid})`, 'info');
            return true;
          }
        } catch (error) {
          log(`Failed to start ${command.cmd}: ${error.message}`, 'warn');
          if (this.audioProcess) {
            this.audioProcess.kill();
            this.audioProcess = null;
          }
        }
      }

      log('No audio recording command available - will use fallback', 'warn');
      // Return true to indicate "success" but we'll handle the fallback in the state manager
      return true;

    } catch (error) {
      log(`macOS recording failed: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Starts recording on Windows
   * @param {number} sampleRate - Sample rate
   * @param {number} channels - Number of channels
   * @param {string} format - Audio format
   * @param {Object} availableCommands - Available commands
   * @returns {Promise<boolean>} - Success status
   */
  async startWindowsRecording(sampleRate, channels, format, availableCommands) {
    try {
      const { spawn } = await import('child_process');
      
      if (!availableCommands.ffmpeg) {
        log('ffmpeg not available on Windows', 'error');
        return false;
      }
      
      this.audioProcess = spawn('ffmpeg', [
        '-f', 'dshow',
        '-i', 'audio="Microphone"',
        '-ar', sampleRate.toString(),
        '-ac', channels.toString(),
        '-acodec', 'pcm_s16le',
        '-y',
        this.recordingPath
      ], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.audioProcess.on('error', (error) => {
        log(`ffmpeg error: ${error.message}`, 'error');
      });

      // Wait a bit to see if the process starts successfully
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (this.audioProcess.pid) {
        log(`Successfully started ffmpeg recording (PID: ${this.audioProcess.pid})`, 'info');
        return true;
      }

      return false;

    } catch (error) {
      log(`Windows recording failed: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Starts recording on Linux
   * @param {number} sampleRate - Sample rate
   * @param {number} channels - Number of channels
   * @param {string} format - Audio format
   * @param {Object} availableCommands - Available commands
   * @returns {Promise<boolean>} - Success status
   */
  async startLinuxRecording(sampleRate, channels, format, availableCommands) {
    try {
      const { spawn } = await import('child_process');
      
      // Try arecord first, then ffmpeg
      const commands = [
        {
          cmd: 'arecord',
          available: availableCommands.arecord,
          args: [
            '-f', 'S16_LE',
            '-r', sampleRate.toString(),
            '-c', channels.toString(),
            '-D', 'default',
            this.recordingPath
          ]
        },
        {
          cmd: 'ffmpeg',
          available: availableCommands.ffmpeg,
          args: [
            '-f', 'alsa',
            '-i', 'default',
            '-ar', sampleRate.toString(),
            '-ac', channels.toString(),
            '-acodec', 'pcm_s16le',
            '-y',
            this.recordingPath
          ]
        }
      ];

      for (const command of commands) {
        if (!command.available) {
          log(`${command.cmd} not available, skipping...`, 'warn');
          continue;
        }

        try {
          log(`Trying ${command.cmd} for audio recording...`, 'info');
          
          this.audioProcess = spawn(command.cmd, command.args, {
            stdio: ['ignore', 'pipe', 'pipe']
          });

          this.audioProcess.on('error', (error) => {
            log(`${command.cmd} error: ${error.message}`, 'error');
          });

          // Wait a bit to see if the process starts successfully
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (this.audioProcess.pid) {
            log(`Successfully started ${command.cmd} recording (PID: ${this.audioProcess.pid})`, 'info');
            return true;
          }
        } catch (error) {
          log(`Failed to start ${command.cmd}: ${error.message}`, 'warn');
          if (this.audioProcess) {
            this.audioProcess.kill();
            this.audioProcess = null;
          }
        }
      }

      log('No audio recording command available - will use fallback', 'warn');
      // Return true to indicate "success" but we'll handle the fallback in the state manager
      return true;

    } catch (error) {
      log(`Linux recording failed: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Stops audio recording
   * @returns {Promise<Object>} - Recording result with audio data
   */
  async stopRecording() {
    if (!this.isRecording) {
      log('No audio recording in progress', 'warn');
      return null;
    }

    try {
      log('Stopping native audio recording...', 'info');
      this.isRecording = false;

      // Stop the recording process
      if (this.audioProcess) {
        this.audioProcess.kill('SIGTERM');
        this.audioProcess = null;
      }

      // Read the recorded file
      let result = await this.readRecordingFile();
      
      // If no recording file was created (fallback case), create a mock result
      if (!result.success && !this.audioProcess) {
        log('No recording process was started, creating fallback result', 'warn');
        result = {
          success: true,
          duration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0,
          fileSize: 0,
          formats: {
            raw: Buffer.alloc(0),
            base64: '',
            path: null
          }
        };
      }
      
      const duration = this.recordingStartTime ? Date.now() - this.recordingStartTime : 0;
      this.recordingStartTime = null;

      log(`Audio recording stopped (duration: ${duration}ms)`, 'info');
      this.emit('recordingStopped', result);
      return result;

    } catch (error) {
      log(`Error stopping audio recording: ${error.message}`, 'error');
      this.emit('recordingError', error);
      return null;
    }
  }

  /**
   * Reads the recorded audio file
   * @returns {Promise<Object>} - Audio data
   */
  async readRecordingFile() {
    try {
      if (!this.recordingPath || !fs.existsSync(this.recordingPath)) {
        log('Recording file not found', 'warn');
        return { success: false, error: 'File not found' };
      }

      const stats = fs.statSync(this.recordingPath);
      const audioBuffer = fs.readFileSync(this.recordingPath);
      
      // Convert to base64 for transmission
      const base64Data = audioBuffer.toString('base64');

      // Clean up the temporary file
      try {
        fs.unlinkSync(this.recordingPath);
      } catch (error) {
        log(`Failed to delete temporary file: ${error.message}`, 'warn');
      }

      return {
        success: true,
        duration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0,
        fileSize: stats.size,
        formats: {
          raw: audioBuffer,
          base64: base64Data,
          path: this.recordingPath
        }
      };

    } catch (error) {
      log(`Failed to read recording file: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * Gets current recording state
   * @returns {Object} - Recording state
   */
  getRecordingState() {
    return {
      isRecording: this.isRecording,
      startTime: this.recordingStartTime,
      duration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0,
      processId: this.audioProcess?.pid || null
    };
  }

  /**
   * Checks if currently recording
   * @returns {boolean} - Recording status
   */
  isCurrentlyRecording() {
    return this.isRecording;
  }

  /**
   * Force stop recording (for cleanup)
   */
  async forceStop() {
    if (this.isRecording) {
      log('Force stopping audio recording', 'warn');
      await this.stopRecording();
    }
  }

  /**
   * Gets available audio recording commands
   * @returns {Promise<Object>} - Available commands
   */
  async getAvailableCommands() {
    const { spawn, execSync } = await import('child_process');
    
    const commands = {
      sox: false,
      ffmpeg: false,
      arecord: false
    };

    // Simple synchronous check using 'which' command
    try {
      execSync('which sox', { stdio: 'ignore' });
      commands.sox = true;
      log('sox found via which command', 'info');
    } catch (error) {
      log('sox not found via which command', 'warn');
    }

    try {
      execSync('which ffmpeg', { stdio: 'ignore' });
      commands.ffmpeg = true;
      log('ffmpeg found via which command', 'info');
    } catch (error) {
      log('ffmpeg not found via which command', 'warn');
    }

    if (process.platform === 'linux') {
      try {
        execSync('which arecord', { stdio: 'ignore' });
        commands.arecord = true;
        log('arecord found via which command', 'info');
      } catch (error) {
        log('arecord not found via which command', 'warn');
      }
    }

    // Additional verification using spawn (only if which command found them)
    if (commands.sox) {
      try {
        const soxProcess = spawn('sox', ['--version'], { stdio: 'ignore' });
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            soxProcess.kill();
            resolve();
          }, 2000);
          
          soxProcess.on('exit', (code) => {
            clearTimeout(timeout);
            commands.sox = code === 0;
            resolve();
          });
          
          soxProcess.on('error', (error) => {
            clearTimeout(timeout);
            commands.sox = false;
            log(`sox verification failed: ${error.message}`, 'warn');
            resolve();
          });
        });
      } catch (error) {
        commands.sox = false;
        log(`sox verification error: ${error.message}`, 'warn');
      }
    }

    if (commands.ffmpeg) {
      try {
        const ffmpegProcess = spawn('ffmpeg', ['-version'], { stdio: 'ignore' });
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            ffmpegProcess.kill();
            resolve();
          }, 2000);
          
          ffmpegProcess.on('exit', (code) => {
            clearTimeout(timeout);
            commands.ffmpeg = code === 0;
            resolve();
          });
          
          ffmpegProcess.on('error', (error) => {
            clearTimeout(timeout);
            commands.ffmpeg = false;
            log(`ffmpeg verification failed: ${error.message}`, 'warn');
            resolve();
          });
        });
      } catch (error) {
        commands.ffmpeg = false;
        log(`ffmpeg verification error: ${error.message}`, 'warn');
      }
    }

    if (process.platform === 'linux' && commands.arecord) {
      try {
        const arecordProcess = spawn('arecord', ['--version'], { stdio: 'ignore' });
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            arecordProcess.kill();
            resolve();
          }, 2000);
          
          arecordProcess.on('exit', (code) => {
            clearTimeout(timeout);
            commands.arecord = code === 0;
            resolve();
          });
          
          arecordProcess.on('error', (error) => {
            clearTimeout(timeout);
            commands.arecord = false;
            log(`arecord verification failed: ${error.message}`, 'warn');
            resolve();
          });
        });
      } catch (error) {
        commands.arecord = false;
        log(`arecord verification error: ${error.message}`, 'warn');
      }
    }

    log(`Available commands: ${JSON.stringify(commands)}`, 'info');
    return commands;
  }
}

// Export singleton instance
export const audioRecorder = new AudioRecorder();
