# Native Audio Recording Documentation

**⚠️ WIP (Work In Progress) ⚠️**

This document describes the native audio recording functionality implemented in Speech Paste, which allows for direct audio capture and storage in the state manager.

**Note: This feature is currently disabled due to unresolved issues with system command availability and integration. The app will fall back to browser-based recording.**

## Overview

The native audio recording system provides:
- **Cross-platform audio recording** using system commands (sox, ffmpeg, arecord)
- **Audio data storage** in the state manager with multiple formats
- **IPC exposure** for renderer processes to access recording capabilities
- **Configurable recording options** (sample rate, channels, format)

## Architecture

### Components

1. **Audio Recorder Service** (`electron/services/audio-recorder.js`)
   - Handles native audio recording using system commands
   - Supports multiple platforms (macOS, Windows, Linux)
   - Converts audio to various formats (WAV, base64)

2. **State Manager Integration** (`electron/recording/state-manager.js`)
   - Integrates audio recording with existing recording state
   - Stores audio data alongside recording metadata
   - Provides unified recording interface

3. **IPC Handlers** (`electron/ipc/handlers.js`)
   - Exposes recording functionality to renderer processes
   - Handles audio recording operations via IPC
   - Provides both high-level and direct access APIs

4. **Preload Script** (`electron/preload-audio.js`)
   - Exposes audio recording API to renderer processes
   - Provides event listeners for recording events
   - Ensures secure context isolation

## Usage

### Basic Recording

```javascript
// Start recording with default options
const result = await window.audioRecording.startRecording();

// Stop recording and get audio data
const audioData = await window.audioRecording.stopRecording();
```

### Custom Recording Options

```javascript
// Configure recording options
const options = {
  sampleRate: 44100,    // Sample rate in Hz
  channels: 1,          // Number of channels (1=mono, 2=stereo)
  format: 'wav'         // Audio format ('wav', 'raw')
};

// Start recording with custom options
const result = await window.audioRecording.startRecording(options);
```

### Toggle Recording

```javascript
// Toggle recording state
const result = await window.audioRecording.toggleRecording(options);
```

### Get Recording State

```javascript
// Get current recording state
const state = await window.audioRecording.getRecordingState();
console.log(state);
// {
//   isRecording: true,
//   startTime: 1234567890,
//   duration: 5000,
//   audioData: {...},
//   options: {...}
// }
```

### Get Stored Audio Data

```javascript
// Get previously recorded audio data
const audioData = await window.audioRecording.getAudioData();
if (audioData.success && audioData.audioData) {
  const { base64, raw, path } = audioData.audioData.formats;
  // Use audio data as needed
}
```

### Event Listeners

```javascript
// Listen for recording events
window.audioRecording.on.recordingStarted(() => {
  console.log('Recording started');
});

window.audioRecording.on.recordingStopped(() => {
  console.log('Recording stopped');
});

window.audioRecording.on.audioDataReady((data) => {
  console.log('Audio data ready:', data);
});

window.audioRecording.on.recordingError((error) => {
  console.error('Recording error:', error);
});
```

## API Reference

### Main API

#### `startRecording(options?)`
Starts native audio recording.

**Parameters:**
- `options` (Object, optional): Recording options
  - `sampleRate` (number): Sample rate in Hz (default: 44100)
  - `channels` (number): Number of channels (default: 1)
  - `format` (string): Audio format (default: 'wav')

**Returns:** Promise<Object>
- `success` (boolean): Whether recording started successfully
- `error` (string, optional): Error message if failed

#### `stopRecording()`
Stops native audio recording and returns audio data.

**Returns:** Promise<Object>
- `success` (boolean): Whether recording stopped successfully
- `result` (Object, optional): Audio data if successful
- `error` (string, optional): Error message if failed

#### `toggleRecording(options?)`
Toggles recording state (start if stopped, stop if recording).

**Parameters:**
- `options` (Object, optional): Recording options (same as startRecording)

**Returns:** Promise<Object>
- `success` (boolean): Whether operation succeeded
- `result` (Object, optional): Audio data if stopped
- `error` (string, optional): Error message if failed

#### `getRecordingState()`
Gets current recording state.

**Returns:** Promise<Object>
- `success` (boolean): Whether operation succeeded
- `state` (Object): Recording state object
- `error` (string, optional): Error message if failed

#### `getAudioData()`
Gets stored audio data from last recording.

**Returns:** Promise<Object>
- `success` (boolean): Whether operation succeeded
- `audioData` (Object, optional): Audio data object
- `error` (string, optional): Error message if failed

#### `setRecordingOptions(options)`
Sets default recording options.

**Parameters:**
- `options` (Object): Recording options

**Returns:** Promise<Object>
- `success` (boolean): Whether operation succeeded
- `error` (string, optional): Error message if failed

#### `getAvailableCommands()`
Gets available audio recording commands on the system.

**Returns:** Promise<Object>
- `success` (boolean): Whether operation succeeded
- `commands` (Object): Available commands object
- `error` (string, optional): Error message if failed

### Direct API

For advanced usage, you can access the audio recorder directly:

#### `direct.start(options?)`
Start recording directly (bypasses state manager).

#### `direct.stop()`
Stop recording directly.

#### `direct.getState()`
Get direct recording state.

### Event Listeners

#### `on.recordingStarted(callback)`
Listen for recording started events.

#### `on.recordingStopped(callback)`
Listen for recording stopped events.

#### `on.audioDataReady(callback)`
Listen for audio data ready events.

#### `on.recordingError(callback)`
Listen for recording error events.

## Audio Data Format

When recording is stopped, the audio data is returned in the following format:

```javascript
{
  success: true,
  duration: 5000,           // Recording duration in milliseconds
  fileSize: 441000,         // File size in bytes
  formats: {
    raw: Buffer,            // Raw audio buffer
    base64: "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA...", // Base64 encoded
    path: "/tmp/speech-paste-recording-1234567890.wav" // Temporary file path
  }
}
```

## Platform Support

### macOS
- **Primary:** sox (if available)
- **Fallback:** ffmpeg with avfoundation
- **Commands:** `sox -d -r 44100 -c 1 -b 16 output.wav`

### Windows
- **Primary:** ffmpeg with dshow
- **Commands:** `ffmpeg -f dshow -i audio="Microphone" -ar 44100 -ac 1 -acodec pcm_s16le output.wav`

### Linux
- **Primary:** arecord (if available)
- **Fallback:** ffmpeg with alsa
- **Commands:** `arecord -f S16_LE -r 44100 -c 1 -D default output.wav`

## Testing

A test interface is available at `renderer/audio-test.html` that demonstrates all the audio recording functionality. To open it:

1. Use the IPC handler: `ipcRenderer.send('settings:openAudioTest')`
2. Or create the window directly: `createAudioTestWindow()`

The test interface includes:
- Recording controls (start, stop, toggle)
- Recording options configuration
- Available commands display
- Real-time state monitoring
- Audio data display
- Direct API testing

## Error Handling

The audio recording system includes comprehensive error handling:

1. **Command Availability:** Checks for available recording commands
2. **Permission Handling:** Requests microphone permissions when needed
3. **Process Management:** Properly starts and stops recording processes
4. **File Management:** Handles temporary file creation and cleanup
5. **Format Conversion:** Converts audio to various formats safely

## Security Considerations

- **Context Isolation:** All IPC communication uses context isolation
- **Preload Scripts:** Audio recording API is exposed through secure preload scripts
- **File Permissions:** Temporary files are created in system temp directory
- **Process Isolation:** Recording processes are properly isolated and cleaned up

## Troubleshooting

### Common Issues

1. **No recording commands available**
   - Install sox: `brew install sox` (macOS) or `apt install sox` (Linux)
   - Install ffmpeg: `brew install ffmpeg` (macOS) or `apt install ffmpeg` (Linux)

2. **Permission denied**
   - Grant microphone access in system preferences
   - Check application permissions

3. **Recording fails to start**
   - Check available commands with `getAvailableCommands()`
   - Verify microphone is not in use by another application

4. **Audio quality issues**
   - Adjust sample rate and channel count
   - Check microphone settings in system preferences

### Debug Information

Enable debug logging to see detailed information about the recording process:

```javascript
// Check available commands
const commands = await window.audioRecording.getAvailableCommands();
console.log('Available commands:', commands);

// Check recording state
const state = await window.audioRecording.getRecordingState();
console.log('Recording state:', state);
```
