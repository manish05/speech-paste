import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keychain configuration
export const KEYCHAIN_SERVICE_NEW = 'SpeakPaste';
export const KEYCHAIN_SERVICE_OLD = 'GeminiMicTranscriber';
export const KEYCHAIN_ACCOUNT = 'apiKey';

// AI configuration
export const DEFAULT_MODEL = 'gemini-2.5-flash';

// Global shortcuts
export const GLOBAL_SHORTCUT = 'CommandOrControl+Shift+Space';

// Window dimensions
export const WINDOW_CONFIG = {
  recorder: { width: 300, height: 200 },
  settings: { width: 440, height: 480 }
};

// Utility function to resolve asset paths
export function resolveAsset(relativePath) {
  return path.join(__dirname, '..', relativePath);
}
