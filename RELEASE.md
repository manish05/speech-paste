# Speech Paste v1.0.0 - macOS Universal App Release

## 🎉 Release Summary

This release provides a macOS universal app that runs on both Apple Silicon (M1/M2/M3) and Intel-based Macs.

## 📦 What's Included

### Built Files (in `dist/` directory)
- **`Speech Paste.app`** - Universal macOS application
- **`Speech Paste-1.0.0-universal.dmg`** - DMG installer (200MB)
- **`Speech Paste-1.0.0-universal-mac.zip`** - ZIP archive (194MB)

## 🚀 How to Install and Run

### Option 1: DMG Installer (Recommended)
1. Download `Speech Paste-1.0.0-universal.dmg`
2. Double-click to mount the DMG
3. Drag "Speech Paste" to your Applications folder
4. Launch from Applications or Spotlight

### Option 2: ZIP Archive
1. Download `Speech Paste-1.0.0-universal-mac.zip`
2. Extract the ZIP file
3. Move `Speech Paste.app` to your Applications folder
4. Launch from Applications or Spotlight

### Option 3: Direct Run
1. Download either file
2. Extract/mount as needed
3. Right-click `Speech Paste.app` and select "Open"
4. Click "Open" in the security dialog

## 🔧 First Run Setup

1. **Grant Microphone Permission**: The app will request microphone access
2. **Enter API Key**: Go to Settings and add your Google Gemini API key
3. **Test Microphone**: Use the mic test feature to verify audio input
4. **Set Global Shortcut**: Configure your preferred keyboard shortcut

## 🛠️ Features

- **Universal Binary**: Works on Apple Silicon and Intel Macs
- **Global Hotkey**: Record audio with keyboard shortcut
- **Speech-to-Text**: Powered by Google Gemini AI
- **Auto-Paste**: Transcribed text automatically copied to clipboard
- **System Tray**: Runs in background with tray icon
- **Settings UI**: Easy configuration interface

## 🔒 Security Notes

- **Not Code Signed**: This is a development build
- **Gatekeeper**: You may need to right-click and "Open" on first run
- **Permissions**: App requires microphone and accessibility permissions

## 🐛 Troubleshooting

### "App is damaged" error
```bash
xattr -cr "Speech Paste.app"
```

### Permission denied
- Check System Preferences > Security & Privacy
- Grant microphone and accessibility permissions

### App won't start
- Check Console.app for error messages
- Ensure all dependencies are properly installed

## 📋 System Requirements

- **macOS**: 10.12 (Sierra) or later
- **Architecture**: Apple Silicon (M1/M2/M3) or Intel x64
- **Memory**: 512MB RAM minimum
- **Storage**: 200MB free space

## 🔄 Development

To build from source:
```bash
bun install
bun run build:mac-universal
```

## 📝 Release Notes

### v1.0.0
- Initial release
- Universal macOS app (Apple Silicon + Intel)
- Speech-to-text transcription
- Global hotkey recording
- System tray integration
- Settings management
- DMG and ZIP distribution

## 🔗 Links

- **Repository**: https://github.com/manish05/speech-paste
- **Issues**: https://github.com/manish05/speech-paste/issues
- **Build Guide**: See `BUILD.md` for development instructions
