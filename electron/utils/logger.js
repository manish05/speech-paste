import { Notification } from 'electron';

/**
 * Logs messages with consistent formatting
 * @param {string} message - Message to log
 * @param {string} level - Log level (info, warn, error)
 */
export function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  console[level](`${prefix} ${message}`);
}

/**
 * Creates a notification with consistent styling
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
export function showNotification(title, body) {
  new Notification({ title, body }).show();
}
