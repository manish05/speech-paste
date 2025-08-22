# 🎤 Try Speech Paste - Quick Start Guide

## What is Speech Paste?
Speech Paste is a simple app that converts your voice to text and automatically copies it to your clipboard. Perfect for:
- Taking quick notes
- Writing emails
- Creating documents
- Any task where you prefer speaking over typing

## 🚀 Quick Start (3 Steps)

### Step 1: Download the App
1. Go to the `dist` folder in this repository
2. Download `Speech Paste-1.0.0-universal.dmg` (the DMG file)
3. Double-click the DMG file to open it

### Step 2: Install the App
1. Drag the "Speech Paste" app to your Applications folder
2. Close the DMG window
3. Go to your Applications folder and find "Speech Paste"

### Step 3: First Run Setup
1. **Right-click** on "Speech Paste" and select "Open"
2. Click "Open" when macOS asks about the unidentified developer
3. The app will appear in your menu bar (top-right of screen)
4. Click the microphone icon in the menu bar
5. Click "Settings" and add your Google Gemini API key

## 🔑 Getting Your API Key (Free)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (looks like: `AIzaSyC...`)
5. Paste it in the Speech Paste Settings

## 🎯 How to Use

### Basic Usage:
1. **Press** `Cmd + Shift + R` (or your custom shortcut)
2. **Speak** clearly into your microphone
3. **Press** the shortcut again to stop recording
4. **Paste** anywhere with `Cmd + V` - your text is ready!

### Menu Bar Options:
- **Settings**: Configure API key and shortcuts
- **Test Mic**: Check if your microphone works
- **Quit**: Close the app

## 🛠️ Troubleshooting

### "App is damaged" error?
```bash
# Open Terminal and run:
xattr -cr "/Applications/Speech Paste.app"
```

### App won't open?
- Right-click the app and select "Open"
- Check System Preferences > Security & Privacy

### Microphone not working?
- Go to System Preferences > Security & Privacy > Microphone
- Make sure "Speech Paste" is checked

### No text appears?
- Check your internet connection
- Verify your API key is correct in Settings
- Try the "Test Mic" feature first

## 💡 Tips for Best Results

1. **Speak clearly** and at a normal pace
2. **Use a quiet environment** for better accuracy
3. **Keep the app running** in the background
4. **Test your mic** before important recordings
5. **Use the global shortcut** for quick access

## 🔧 Customization

### Change the Shortcut:
1. Open Speech Paste Settings
2. Click on the shortcut field
3. Press your desired key combination
4. Click "Save"

### App Behavior:
- The app runs in the background
- It appears as a microphone icon in your menu bar
- You can quit it anytime from the menu

## 📱 What Works Best

- **Short phrases** (1-2 sentences)
- **Clear pronunciation**
- **English language** (primary support)
- **Quiet background**
- **Good microphone quality**

## 🆘 Need Help?

- Check the `RELEASE.md` file for detailed information
- Look at `BUILD.md` if you want to build from source
- The app logs errors to Console.app if something goes wrong

## 🎉 You're Ready!

That's it! You now have a powerful speech-to-text tool that works with any application on your Mac. Just press your shortcut, speak, and paste your text anywhere.

**Happy speaking! 🎤✨**
