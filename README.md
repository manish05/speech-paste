# 🎤 Speech Paste

A macOS mini app that transcribes audio to text and automatically copies it to your clipboard. Perfect for quickly converting speech to text and pasting it anywhere with a simple keyboard shortcut.

## ✨ Features

- **Global Hotkey**: Press `Cmd+Shift+Space` to start/stop recording
- **Automatic Transcription**: Uses Google's Gemini AI for accurate speech-to-text conversion
- **Instant Clipboard Copy**: Transcribed text is automatically copied to your clipboard
- **Universal Paste**: Use `Cmd+V` to paste the transcribed text anywhere
- **Tray Icon**: Runs silently in the background with a system tray icon
- **Secure API Key Storage**: Your Gemini API key is securely stored in the macOS keychain
- **Modern UI**: Clean, minimal interface that doesn't interfere with your workflow

## 🚀 Quick Start

### Prerequisites

- macOS 10.15 or later
- [Bun](https://bun.sh) package manager
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd speech-paste
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run the app**
   ```bash
   bun run dev
   ```

### First-Time Setup

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key for the next step

2. **Configure the App**
   - Right-click the tray icon (🎤) in your menu bar
   - Select "Settings"
   - Paste your Gemini API key
   - Click "Save"

3. **Grant Permissions**
   - The app will request microphone access - allow it
   - The app will request accessibility permissions for global shortcuts - allow it

## 🎯 How to Use

### Basic Usage

1. **Start Recording**: Press `Cmd+Shift+Space`
   - A small recording window will appear
   - The red dot indicates active recording
   - Speak clearly into your microphone

2. **Stop Recording**: Press `Cmd+Shift+Space` again or click the "Stop" button
   - The app will process your audio
   - Transcribed text is automatically copied to clipboard

3. **Paste Anywhere**: Press `Cmd+V` in any application
   - Your transcribed text will be pasted instantly

### Advanced Features

- **Restart Recording**: If something goes wrong, click "Restart" to try again
- **Settings Access**: Right-click the tray icon and select "Settings" to change your API key
- **Mic Test**: Use the mic test feature in settings to verify your microphone is working

## ⚙️ Configuration

### Global Shortcut
The default shortcut is `Cmd+Shift+Space`. This can be modified in the code at `electron/config.js`.

### Supported Audio Formats
The app supports various audio formats including:
- WebM (Opus codec)
- MP4
- MPEG
- WAV
- OGG

### API Model
Uses Google's `gemini-2.5-flash` model for fast and accurate transcription.

## 🔧 Development

### Project Structure
```
speech-paste/
├── electron/           # Main Electron process
│   ├── main.js        # App entry point
│   ├── windows/       # Window management
│   ├── services/      # API services
│   ├── recording/     # Audio recording logic
│   └── utils/         # Utilities
├── renderer/          # UI components
│   ├── recorder.html  # Recording interface
│   └── settings.html  # Settings interface
└── assets/           # Icons and resources
```

### Available Scripts

- `bun run dev` - Start the app in development mode
- `bun run start` - Start the app
- `bun run icons` - Generate app icons

### Building for Distribution

To create a distributable app:
```bash
# Install electron-builder
bun add -D electron-builder

# Build for macOS
bun run build
```

## 🛠️ Troubleshooting

### Common Issues

**"No API key found"**
- Open Settings and add your Gemini API key
- Make sure the key is valid and has proper permissions

**"Recording failed"**
- Check microphone permissions in System Preferences
- Ensure your microphone is working in other applications
- Try the mic test feature in settings

**"Copy failed"**
- Check clipboard permissions
- Restart the app and try again

**Global shortcut not working**
- Grant accessibility permissions in System Preferences > Security & Privacy > Privacy > Accessibility
- Add the app to the list of allowed applications

### Debug Mode

To see detailed logs, run the app from terminal:
```bash
bun run dev
```

## 🔒 Privacy & Security

- **Local Processing**: Audio is processed locally before being sent to Google's API
- **Secure Storage**: API keys are stored securely in macOS keychain
- **No Data Retention**: Audio data is not stored permanently
- **Minimal Permissions**: Only requests microphone and accessibility permissions

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information about your problem

---

**Happy transcribing! 🎤✨**
