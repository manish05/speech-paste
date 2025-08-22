# Building Speech Paste for macOS

This guide will help you create a macOS universal app that runs on both Apple Silicon (M1/M2/M3) and Intel-based Macs.

## Prerequisites

1. **macOS**: You need to be on macOS to build for macOS
2. **Xcode Command Line Tools**: Install the latest version
   ```bash
   xcode-select --install
   ```
3. **Bun**: Make sure you have Bun installed
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

## Build Steps

### 1. Install Dependencies

```bash
bun install
```

### 2. Generate Assets

Generate the app icons and DMG background:

```bash
# Generate app icons
bun run icons

# Generate DMG background
bun run dmg-bg
```

### 3. Build the Universal App

Choose one of the following build commands:

#### Option A: Build Universal App (Recommended)
```bash
bun run build:mac-universal
```

#### Option B: Build with Distribution
```bash
bun run dist:mac-universal
```

#### Option C: Build All Platforms
```bash
bun run build
```

### 4. Find Your Built App

After building, you'll find the following files in the `dist` directory:

- `Speech Paste.app` - The universal macOS application
- `Speech Paste-<version>-universal.dmg` - DMG installer
- `Speech Paste-<version>-universal.zip` - ZIP archive

## Running the App

### From Development
```bash
bun run dev
```

### From Built App
1. Navigate to the `dist` directory
2. Double-click `Speech Paste.app` or mount the DMG file
3. Drag the app to your Applications folder
4. Launch from Applications or Spotlight

## Troubleshooting

### Common Issues

1. **"App is damaged" error**
   - Right-click the app and select "Open"
   - Or run: `xattr -cr "Speech Paste.app"`

2. **Permission denied errors**
   - Make sure you have the necessary permissions
   - Check that Xcode Command Line Tools are installed

3. **Build fails with architecture errors**
   - Ensure you're building on macOS
   - Update Xcode Command Line Tools: `xcode-select --install`

4. **App doesn't start**
   - Check Console.app for error messages
   - Ensure all dependencies are properly installed

### Code Signing (Optional)

For distribution outside your Mac, you'll need to code sign the app:

1. Get an Apple Developer account
2. Create a Developer ID certificate
3. Add to package.json:
   ```json
   "mac": {
     "identity": "Developer ID Application: Your Name (TEAM_ID)"
   }
   ```

## Build Configuration

The build is configured in `package.json` under the `build` section:

- **Universal Binary**: Supports both Apple Silicon and Intel
- **Hardened Runtime**: Required for macOS security
- **Entitlements**: Configured for microphone and network access
- **DMG**: Creates a professional installer

## Development vs Production

- **Development**: Use `bun run dev` for quick testing
- **Production**: Use `bun run build:mac-universal` for distribution

## File Structure After Build

```
dist/
├── Speech Paste.app/          # Universal macOS app
├── Speech Paste-1.0.0-universal.dmg
└── Speech Paste-1.0.0-universal.zip
```

## Next Steps

1. Test the app on both Apple Silicon and Intel Macs
2. Consider code signing for distribution
3. Test all features (microphone, clipboard, etc.)
4. Create a custom DMG background if desired
