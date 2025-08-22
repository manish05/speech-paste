import keytar from 'keytar';
import { log } from '../utils/logger.js';
import { 
  KEYCHAIN_SERVICE_NEW, 
  KEYCHAIN_SERVICE_OLD, 
  KEYCHAIN_ACCOUNT 
} from '../config.js';

/**
 * Retrieves API key from keychain with legacy migration support
 * @returns {Promise<string|null>} API key or null if not found
 */
export async function getApiKey() {
  try {
    // Try current keychain service first
    const current = await keytar.getPassword(KEYCHAIN_SERVICE_NEW, KEYCHAIN_ACCOUNT);
    if (current) return current;
    
    // Try legacy keychain service
    const legacy = await keytar.getPassword(KEYCHAIN_SERVICE_OLD, KEYCHAIN_ACCOUNT);
    if (legacy) {
      await migrateLegacyApiKey(legacy);
      return legacy;
    }
    
    return null;
  } catch (error) {
    log(`Failed to get API key from keychain: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Migrates API key from legacy keychain service to new service
 * @param {string} legacyKey - Legacy API key
 */
async function migrateLegacyApiKey(legacyKey) {
  try {
    await keytar.setPassword(KEYCHAIN_SERVICE_NEW, KEYCHAIN_ACCOUNT, legacyKey);
    await keytar.deletePassword(KEYCHAIN_SERVICE_OLD, KEYCHAIN_ACCOUNT);
    log('Successfully migrated legacy API key');
  } catch (error) {
    log(`Failed to migrate legacy API key: ${error.message}`, 'warn');
  }
}

/**
 * Sets API key in keychain with validation
 * @param {string} value - API key to store
 * @returns {Promise<boolean>} Success status
 */
export async function setApiKey(value) {
  try {
    if (!keytar) {
      log('Keytar is not available', 'error');
      return false;
    }
    
    if (!value) {
      await clearApiKey();
      return true;
    }
    
    log(`Setting API key in keychain, length: ${value.length}`);
    
    await keytar.setPassword(KEYCHAIN_SERVICE_NEW, KEYCHAIN_ACCOUNT, value);
    
    // Verify the key was saved correctly
    const savedKey = await keytar.getPassword(KEYCHAIN_SERVICE_NEW, KEYCHAIN_ACCOUNT);
    if (savedKey !== value) {
      log('API key verification failed - saved key does not match', 'error');
      return false;
    }
    
    log('Successfully set and verified API key in keychain');
    await clearLegacyApiKey();
    return true;
  } catch (error) {
    log(`Failed to set API key in keychain: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Clears API key from keychain
 */
async function clearApiKey() {
  log('Clearing API key from keychain');
  try {
    await keytar.deletePassword(KEYCHAIN_SERVICE_NEW, KEYCHAIN_ACCOUNT);
    log('Cleared new keychain entry');
  } catch (error) {
    log(`No new keychain entry to clear: ${error.message}`);
  }
}

/**
 * Clears legacy API key from keychain
 */
async function clearLegacyApiKey() {
  try {
    await keytar.deletePassword(KEYCHAIN_SERVICE_OLD, KEYCHAIN_ACCOUNT);
    log('Cleared old keychain entry');
  } catch (error) {
    log(`No old keychain entry to clear: ${error.message}`);
  }
}
