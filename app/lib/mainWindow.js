const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const menuTemplate = require('./menuTemplate')

const OSX = process.platform === 'darwin'
const WIN = process.platform === 'win32'

const mainWindow = new BrowserWindow({
  frame: !WIN,
  width: 792,
  height: 600,
  titleBarStyle: 'hidden-inset',
  webPreferences: {
    blinkFeatures: 'OverlayScrollbars'
  }
})

mainWindow.loadURL('file://' + path.join(__dirname, '/main.html'))

if (OSX) {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}

mainWindow.webContents.on('new-window', e => {
  e.preventDefault()
})

mainWindow.on('close', e => {
  e.preventDefault()
  mainWindow.hide()
})

app.on('activate', e => {
  mainWindow.show()
  mainWindow.focus()
})

app.on('before-quit', e => {
  mainWindow.removeAllListeners()
})

module.exports = mainWindow
