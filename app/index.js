'use strict'

const electron = require('electron')
const { app, BrowserWindow } = electron
const path = require('path')

let mainWindow = null

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    frame: false
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
