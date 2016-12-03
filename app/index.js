'use strict'

const electron = require('electron')
const { app, BrowserWindow } = electron
const path = require('path')

let mainWindow = null
const OSX = process.platform === 'darwin'
const WIN = process.platform === 'win32'

app.on('window-all-closed', () => {
  if (!OSX) {
    app.quit()
  }
})

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    frame: !WIN,
    width: 800,
    height: 600,
    titleBarStyle: 'hidden-inset',
    webPreferences: {
      blinkFeatures: 'OverlayScrollbars'
    }
  })
  mainWindow.loadURL('file://' + path.join(__dirname, '/main.html'))
  mainWindow.webContents.on('new-window', (e) => {
    e.preventDefault()
  })
  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow.hide()
  })
  app.on('activate', (e) => {
    mainWindow.show()
    mainWindow.focus()
  })
  app.on('before-quit', (e) => {
    mainWindow.removeAllListeners()
  })
})
