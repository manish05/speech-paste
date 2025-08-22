import { Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import fs from 'node:fs';
import { resolveAsset } from '../config.js';
import { log } from '../utils/logger.js';
import { startOrStopRecording, startRecording } from '../recording/index.js';
import { recordingStateManager } from '../recording/state-manager.js';
import { createRecorderWindow, getRecorderWindow } from '../windows/recorder.js';
import { positionRecorderWindowNearTray } from '../utils/positioning.js';

/** @type {Tray | null} */
let tray = null;
let onToggleRecording = null;
let onOpenSettings = null;
let isCurrentlyRecording = false;

/**
 * Creates tray icon from SVG or PNG assets
 * @param {boolean} isRecording - Whether currently recording
 * @returns {NativeImage} The tray icon image
 */
function createTrayIconFromSvg(isRecording = false) {
  try {
    // Use the same icon but we'll handle the recording state in the tooltip and menu
    const pngPath = resolveAsset('assets/icons/tray-18.png');
    if (fs.existsSync(pngPath)) {
      const img = nativeImage.createFromPath(pngPath);
      img.setTemplateImage(true);
      return img;
    }
    
    // Fallback to SVG data URL
    const svgPath = resolveAsset('assets/icon.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const base64 = Buffer.from(svgContent, 'utf8').toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64}`;
    const img = nativeImage.createFromDataURL(dataUrl);
    const sized = img.resize({ width: 18, height: 18 });
    sized.setTemplateImage(true);
    return sized;
  } catch (error) {
    log(`Failed to load SVG icon, falling back to empty icon: ${error.message}`, 'warn');
    return nativeImage.createEmpty();
  }
}

/**
 * Updates tray tooltip and menu based on recording state
 * @param {boolean} recording - Whether currently recording
 */
export function setTrayStateRecording(recording) {
  if (!tray) return;
  isCurrentlyRecording = recording;
  tray.setToolTip(recording ? 'Recording… Click to stop' : 'Speak Paste');
  
  // Change the tray icon based on recording state
  if (recording) {
    // Use a different icon or modify the existing one for recording state
    const recordingIconPath = resolveAsset('assets/icons/icon-18.png'); // Use existing icon for now
    if (fs.existsSync(recordingIconPath)) {
      const img = nativeImage.createFromPath(recordingIconPath);
      img.setTemplateImage(true);
      tray.setImage(img);
    }
  } else {
    // Use normal icon
    const normalIconPath = resolveAsset('assets/icons/tray-18.png');
    if (fs.existsSync(normalIconPath)) {
      const img = nativeImage.createFromPath(normalIconPath);
      img.setTemplateImage(true);
      tray.setImage(img);
    }
  }
  
  console.log(`Updating tray state to ${recording ? 'recording' : 'idle'}`);
  updateTrayMenu();
}

/**
 * Shows the context menu at the current mouse position
 */
function showContextMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: recordingStateManager.isCurrentlyRecording() ? 'Stop Recording' : 'Start Recording',
      click: () => {
        console.log(`Tray menu recording toggle clicked - current state: ${recordingStateManager.isCurrentlyRecording() ? 'stopping' : 'starting'}`);
        startOrStopRecording();
      }
    },
    { type: 'separator' },
    {
      label: 'Settings…',
      click: () => {
        console.log('Tray menu settings clicked');
        onOpenSettings();
      }
    },
    { type: 'separator' },
    { role: 'quit', label: 'Quit' }
  ]);
  
  // Show the menu at the current mouse position with a window reference
  const recorderWindow = getRecorderWindow();
  if (recorderWindow && !recorderWindow.isDestroyed()) {
    contextMenu.popup(recorderWindow);
  } else {
    // Fallback: create a temporary window for the menu
    const tempWindow = new BrowserWindow({ 
      show: false, 
      skipTaskbar: true,
      alwaysOnTop: true 
    });
    contextMenu.popup(tempWindow);
    tempWindow.close();
  }
}

/**
 * Handles primary click - opens recorder and starts recording
 */
async function handlePrimaryClick() {
  console.log('=== handlePrimaryClick START ===');
  console.log('Tray primary click - handling recording toggle');
  
  // If already recording, just stop it
  if (recordingStateManager.isCurrentlyRecording()) {
    console.log('Already recording, stopping recording');
    startOrStopRecording();
    console.log('=== handlePrimaryClick END (stopped) ===');
    return;
  }
  
  // If not recording, start recording (this will handle opening the window)
  console.log('Not recording, starting recording');
  try {
    await startRecording();
    console.log('startRecording completed successfully');
  } catch (error) {
    console.error('Error in startRecording:', error);
  }
  console.log('=== handlePrimaryClick END (started) ===');
}

/**
 * Builds the system tray with menu and event handlers
 * @param {Function} toggleRecording - Callback for toggling recording
 * @param {Function} openSettings - Callback for open settings action
 */
export function buildTray(toggleRecording, openSettings) {
  onToggleRecording = toggleRecording;
  onOpenSettings = openSettings;
  
  tray = new Tray(createTrayIconFromSvg(false));
  tray.setToolTip('Speak Paste');
  
  // Ignore double-click events to prevent issues with fast clicking
  tray.setIgnoreDoubleClickEvents(true);
  
  // Handle all click events manually for precise control
  tray.on('click', async (event) => {
    console.log(`Tray click event triggered - button: ${event.button}, type: ${event.type}`);
    
    // On macOS, left clicks don't have button property, so treat undefined as primary click
    // Primary click (left click) - open recorder and start recording
    if (event.button === 0 || event.button === undefined) {
      console.log('Primary click detected, calling handlePrimaryClick');
      await handlePrimaryClick();
    }
    // Secondary click (right click) - show context menu
    else if (event.button === 2) {
      console.log('Secondary click detected, showing context menu');
      showContextMenu();
    }
    else {
      console.log(`Unhandled click button: ${event.button}`);
    }
  });
  
  // Also handle right-click specifically (for some systems)
  tray.on('right-click', (event) => {
    console.log('Tray right-click event triggered');
    showContextMenu();
  });
  
  // Add debugging for other potential events
  tray.on('double-click', (event) => {
    console.log('Tray double-click event triggered');
  });
  
  tray.on('mouse-enter', (event) => {
    console.log('Tray mouse-enter event triggered');
  });
  
  tray.on('mouse-leave', (event) => {
    console.log('Tray mouse-leave event triggered');
  });
  
  // Don't set a default context menu - we'll show it manually
  updateTrayMenu(false);
}

/**
 * Updates the tray context menu based on recording state
 * Note: This function is kept for compatibility but the menu is now shown manually
 */
function updateTrayMenu() {
  // The menu is now built and shown on-demand in showContextMenu()
  // This function is kept for any future use but doesn't set a default context menu
}

/**
 * Gets the current tray instance
 * @returns {Tray | null} The tray instance
 */
export function getTray() {
  return tray;
}

/**
 * Destroys the tray
 */
export function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
