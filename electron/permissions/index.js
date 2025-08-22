import { systemPreferences } from 'electron';
import { log } from '../utils/logger.js';

/**
 * Requests necessary permissions for the app
 */
export async function requestPermissions() {
  try {
    if (process.platform === 'darwin') {
      // Request mic access (shows OS prompt if not yet granted)
      const micAccess = await systemPreferences.askForMediaAccess('microphone');
      log(`Microphone access granted: ${micAccess}`, 'info');
      
      // Prompt to grant Accessibility if not trusted (helps for global shortcut reliability)
      if (!systemPreferences.isTrustedAccessibilityClient(false)) {
        systemPreferences.isTrustedAccessibilityClient(true);
      }
    }
  } catch (error) {
    log(`Permission prompts error: ${error.message}`, 'warn');
  }
}
