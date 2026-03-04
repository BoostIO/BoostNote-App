import { dialog, Notification, MenuItem, ipcMain, BrowserWindow } from 'electron'
import { autoUpdater, UpdateInfo } from 'electron-updater'
import logger from 'electron-log'

autoUpdater.logger = logger
logger.transports.file.level = 'info'

// Types for update preferences
interface UpdatePreferences {
  skipVersion?: string
  remindLaterTimestamp?: number
  lastCheckedVersion?: string
}

// State management
let updater: MenuItem | null = null
let mainWindow: BrowserWindow | null = null
let updateInfo: UpdateInfo | null = null
let isDownloading = false
let downloadProgress = 0

// User preferences (persisted via electron-store or similar)
let updatePrefs: UpdatePreferences = {}

// Auto download is disabled - we want manual control
autoUpdater.autoDownload = false

/**
 * Set the main window for IPC communication
 */
export function setMainWindow(window: BrowserWindow) {
  mainWindow = window
}

/**
 * Load user preferences
 */
export function loadUpdatePreferences(prefs: UpdatePreferences) {
  updatePrefs = { ...updatePrefs, ...prefs }
}

/**
 * Get update preferences
 */
export function getUpdatePreferences(): UpdatePreferences {
  return { ...updatePrefs }
}

/**
 * Check if we should skip this version
 */
function shouldSkipVersion(version: string): boolean {
  if (updatePrefs.skipVersion === version) {
    logger.info(`Skipping version ${version} as per user preference`)
    return true
  }
  
  // Check if "remind me later" is still active (24 hours)
  if (updatePrefs.remindLaterTimestamp) {
    const now = Date.now()
    const remindTime = updatePrefs.remindLaterTimestamp
    const hoursElapsed = (now - remindTime) / (1000 * 60 * 60)
    
    if (hoursElapsed < 24) {
      logger.info(`Skipping check due to "remind me later" preference (${hoursElapsed.toFixed(1)} hours elapsed)`)
      return true
    }
  }
  
  return false
}

/**
 * Show update available dialog with improved options
 */
function showUpdateAvailableDialog(info: UpdateInfo): Promise<string> {
  const version = info.version
  const currentVersion = autoUpdater.currentVersion.version
  
  return dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Available - Boost Note',
      message: `A new version ${version} is available.`,
      detail: `Current version: ${currentVersion}\nNew version: ${version}\n\nWould you like to download and install this update?`,
      buttons: [
        'Yes, Download and Install',
        'No, Skip This Update',
        'Remind Me Later',
      ],
      defaultId: 0,
      cancelId: 2,
      checkboxLabel: 'Don\'t ask again for this version',
      checkboxChecked: false,
    })
    .then(({ response, checkboxChecked }) => {
      if (checkboxChecked && response === 1) {
        // User chose "Skip this version" and checked "Don't ask again"
        updatePrefs.skipVersion = version
        logger.info(`User chose to skip version ${version}`)
      }
      
      switch (response) {
        case 0:
          return 'download'
        case 1:
          updatePrefs.skipVersion = version
          return 'skip'
        case 2:
          updatePrefs.remindLaterTimestamp = Date.now()
          return 'remind-later'
        default:
          updatePrefs.remindLaterTimestamp = Date.now()
          return 'remind-later'
      }
    })
}

/**
 * Show download progress dialog
 */
function showDownloadProgressDialog(): void {
  if (mainWindow) {
    // Send progress to renderer process
    mainWindow.webContents.send('update-download-started')
  }
  
  // Show progress notification
  const notification = new Notification({
    title: 'Downloading Update - Boost Note',
    body: 'The update is being downloaded. You will be notified when it\'s ready.',
  })
  notification.show()
}

/**
 * Show update downloaded dialog with restart options
 */
function showUpdateDownloadedDialog(): Promise<string> {
  return dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Ready - Boost Note',
      message: 'The update has been downloaded and is ready to install.',
      detail: 'You can restart now to apply the update, or continue working and restart later.',
      buttons: [
        'Restart Now',
        'Restart Later',
      ],
      defaultId: 1,
      cancelId: 1,
    })
    .then(({ response }) => {
      return response === 0 ? 'restart' : 'later'
    })
}

// Event handlers
autoUpdater.on('error', (error) => {
  logger.error('Auto updater error:', error)
  isDownloading = false
  
  if (mainWindow) {
    mainWindow.webContents.send('update-error', error.message)
  }
  
  if (updater != null) {
    updater.enabled = true
    updater = null
  }
})

autoUpdater.on('checking-for-update', () => {
  logger.info('Checking for updates...')
  if (mainWindow) {
    mainWindow.webContents.send('update-checking')
  }
})

autoUpdater.on('update-available', async (info) => {
  logger.info(`Update available: ${info.version}`)
  updateInfo = info
  
  // Check if we should skip this version
  if (shouldSkipVersion(info.version)) {
    logger.info(`Skipping version ${info.version}`)
    if (updater != null) {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Skipped - Boost Note',
        message: `Version ${info.version} is available but you've chosen to skip this update.`,
        buttons: ['OK'],
      })
      updater.enabled = true
      updater = null
    }
    return
  }
  
  // Show improved dialog with options
  const choice = await showUpdateAvailableDialog(info)
  
  switch (choice) {
    case 'download':
      isDownloading = true
      showDownloadProgressDialog()
      autoUpdater.downloadUpdate()
      break
    case 'skip':
      logger.info(`User skipped version ${info.version}`)
      if (updater != null) {
        updater.enabled = true
        updater = null
      }
      break
    case 'remind-later':
      logger.info('User chose to be reminded later')
      if (updater != null) {
        updater.enabled = true
        updater = null
      }
      break
  }
})

autoUpdater.on('update-not-available', (info) => {
  logger.info(`No updates available. Current version ${info.version} is up to date.`)
  
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available', info)
  }
  
  if (updater != null) {
    dialog.showMessageBox({
      type: 'info',
      title: 'No Updates - Boost Note',
      message: 'Current version is up-to-date.',
      detail: `You are running the latest version (${info.version}).`,
    })
    updater.enabled = true
    updater = null
  }
})

autoUpdater.on('download-progress', (progressObj) => {
  downloadProgress = progressObj.percent
  const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent.toFixed(2)}% (${progressObj.transferred}/${progressObj.total})`
  logger.info(logMessage)
  
  // Send progress to renderer
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', {
      percent: progressObj.percent,
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total,
    })
  }
  
  // Update menu item if available
  if (updater != null) {
    updater.label = `Downloading Update... ${progressObj.percent.toFixed(0)}%`
  }
})

autoUpdater.on('update-downloaded', async (info) => {
  logger.info(`Update downloaded: ${info.version}`)
  isDownloading = false
  downloadProgress = 100
  
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info)
  }
  
  // Reset menu item
  if (updater != null) {
    updater.label = 'Check for Updates'
    updater.enabled = true
  }
  
  // Show restart dialog
  const choice = await showUpdateDownloadedDialog()
  
  if (choice === 'restart') {
    logger.info('User chose to restart and install')
    setImmediate(() => autoUpdater.quitAndInstall())
  } else {
    logger.info('User chose to restart later')
    // Update menu to show that update is ready
    if (updater != null) {
      updater.label = 'Restart to Update'
      updater = null
    }
  }
})

/**
 * Check for updates (menu triggered)
 */
export function checkForUpdates(menuItem?: MenuItem) {
  if (menuItem) {
    updater = menuItem
    updater.enabled = false
    updater.label = 'Checking for Updates...'
  }
  
  // Reset remind-later if we're manually checking
  updatePrefs.remindLaterTimestamp = undefined
  
  autoUpdater.checkForUpdates()
}

/**
 * Check for updates silently (background)
 */
export function checkForUpdatesSilently() {
  autoUpdater.checkForUpdates()
}

/**
 * Install update without checking (for users who previously skipped)
 */
export function installUpdateWithoutCheck() {
  if (updateInfo) {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Install Update - Boost Note',
        message: `Install version ${updateInfo.version}?`,
        detail: 'This will download and install the update that was previously found.',
        buttons: ['Install', 'Cancel'],
      })
      .then(({ response }) => {
        if (response === 0) {
          isDownloading = true
          showDownloadProgressDialog()
          autoUpdater.downloadUpdate()
        }
      })
  } else {
    // No update info available, check first
    checkForUpdates()
  }
}

/**
 * Restart and install update (if downloaded)
 */
export function restartAndInstall() {
  autoUpdater.quitAndInstall()
}

/**
 * Get current update status
 */
export function getUpdateStatus() {
  return {
    isDownloading,
    downloadProgress,
    updateInfo,
    hasUpdateReady: updateInfo != null && !isDownloading,
  }
}

/**
 * Setup IPC handlers for renderer process
 */
export function setupUpdaterIPC() {
  ipcMain.handle('check-for-updates', () => {
    checkForUpdatesSilently()
  })
  
  ipcMain.handle('install-update', () => {
    installUpdateWithoutCheck()
  })
  
  ipcMain.handle('restart-and-install', () => {
    restartAndInstall()
  })
  
  ipcMain.handle('get-update-status', () => {
    return getUpdateStatus()
  })
}

/**
 * Initialize auto updater
 */
export function initAutoUpdater() {
  // Setup IPC handlers
  setupUpdaterIPC()
  
  // Check for updates after 10 seconds on startup
  setTimeout(() => {
    if (updater == null) {
      logger.info('Performing initial update check...')
      checkForUpdatesSilently()
    }
  }, 10 * 1000)
  
  // Check for updates every 24 hours
  setInterval(() => {
    if (!isDownloading && updater == null) {
      logger.info('Performing daily update check...')
      checkForUpdatesSilently()
    }
  }, 24 * 3600 * 1000)
}
