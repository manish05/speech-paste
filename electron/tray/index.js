import { Tray, Menu, nativeImage } from 'electron';
import fs from 'node:fs';
import { resolveAsset } from '../config.js';
import { log } from '../utils/logger.js';
import { startOrStopRecording } from '../recording/index.js';
import { recordingStateManager } from '../recording/state-manager.js';

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
  
  // Single click to start/stop recording
  tray.on('click', (event) => {
    // Only handle single clicks, not right-clicks
    if (event.button === 0) { // Left click
      console.log('Tray clicked - starting/stopping recording');
      startOrStopRecording();
    }
  });
  
  // Handle right-click for context menu
  tray.on('right-click', (event) => {
    console.log('Tray right-clicked - showing context menu');
    // Context menu will be shown automatically
  });
  
  updateTrayMenu(false);
}

/**
 * Updates the tray context menu based on recording state
 */
function updateTrayMenu() {
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
  tray.setContextMenu(contextMenu);
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
