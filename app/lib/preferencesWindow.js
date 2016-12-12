const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const preferencesWindow = new BrowserWindow({
  width: 800,
  height: 600,
  show: false,
  titleBarStyle: 'hidden-inset',
  webPreferences: {
    blinkFeatures: 'OverlayScrollbars'
  }
})

preferencesWindow.loadURL('file://' + path.join(__dirname, '/preferences.html'))

preferencesWindow.webContents.on('new-window', e => {
  e.preventDefault()
})

preferencesWindow.on('close', e => {
  e.preventDefault()
  preferencesWindow.hide()
})

app.on('before-quit', e => {
  preferencesWindow.removeAllListeners()
})

module.exports = preferencesWindow
