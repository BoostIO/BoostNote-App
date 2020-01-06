const electron = require('electron')
const path = require('path')
require('./menu')

const { app, BrowserWindow } = electron
const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  const windowOptions = {
    webPreferences: { nodeIntegration: true },
    width: 1200,
    height: 800
  }
  if (process.platform === 'darwin') {
    windowOptions.titleBarStyle = 'hiddenInset'
  }
  const window = new BrowserWindow(windowOptions)

  window.loadFile(path.join(__dirname, '../compiled/index.html'))

  window.on('closed', () => {
    mainWindow = null
  })
  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
