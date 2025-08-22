# Electron Main Process - Modular Architecture

This directory contains the refactored Electron main process code, organized into focused modules for better maintainability and separation of concerns.

## Directory Structure

```
electron/
├── main.js                 # Main entry point - orchestrates all modules
├── config.js               # Configuration constants and utilities
├── preload-recorder.js     # Preload script for recorder window
├── preload-settings.js     # Preload script for settings window
├── utils/                  # Utility functions
│   ├── logger.js          # Logging utilities
│   └── positioning.js     # Window positioning utilities
├── services/              # Business logic services
│   ├── keychain.js        # API key management
│   └── transcription.js   # AI transcription service
├── windows/               # Window management
│   ├── recorder.js        # Recorder window management
│   └── settings.js        # Settings window management
├── tray/                  # System tray management
│   └── index.js           # Tray creation and management
├── recording/             # Recording functionality
│   └── index.js           # Recording state and controls
├── ipc/                   # IPC communication
│   └── handlers.js        # IPC event handlers
└── permissions/           # Permission management
    └── index.js           # Permission requests
```

## Module Descriptions

### Core Modules

- **`main.js`**: Application entry point that initializes and orchestrates all other modules
- **`config.js`**: Centralized configuration including constants, window dimensions, and utility functions

### Utility Modules (`utils/`)

- **`logger.js`**: Consistent logging with timestamps and levels
- **`positioning.js`**: Window positioning logic relative to system tray

### Service Modules (`services/`)

- **`keychain.js`**: Secure API key storage and retrieval with legacy migration support
- **`transcription.js`**: AI transcription service using Google Gemini

### Window Modules (`windows/`)

- **`recorder.js`**: Recorder window lifecycle and management
- **`settings.js`**: Settings window lifecycle and management

### Feature Modules

- **`tray/`**: System tray icon, menu, and state management
- **`recording/`**: Recording state management and global shortcuts
- **`ipc/`**: Inter-process communication handlers
- **`permissions/`**: Platform-specific permission requests

## Key Benefits

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Maintainability**: Easier to locate and modify specific functionality
3. **Testability**: Individual modules can be tested in isolation
4. **Reusability**: Modules can be reused across different parts of the application
5. **Readability**: Clear organization makes the codebase easier to understand

## Module Dependencies

The modules follow a clean dependency hierarchy:

```
main.js
├── config.js
├── utils/logger.js
├── utils/positioning.js
├── services/keychain.js
├── services/transcription.js
├── windows/recorder.js
├── windows/settings.js
├── tray/index.js
├── recording/index.js
├── ipc/handlers.js
└── permissions/index.js
```

## Usage

The main process is initialized through `main.js`, which:

1. Sets up logging and configuration
2. Initializes the system tray
3. Creates window instances
4. Registers global shortcuts
5. Sets up IPC handlers
6. Requests necessary permissions

All modules are designed to be stateless where possible, with clear interfaces for communication between components.
