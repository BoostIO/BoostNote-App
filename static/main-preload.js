/* eslint-disable @typescript-eslint/no-var-requires */
;(function () {
  if (typeof require === 'undefined') {
    return
  }
  const electron = require('electron')
  window.electron = electron
  const fs = require('fs')
  const FileType = require('file-type')
  const readChunk = require('read-chunk')
  const CSON = require('cson-parser')

  function openExternal(url) {
    console.log('opening ...', url)
    electron.shell.openExternal(url)
  }
  function readFile(pathname) {
    return new Promise((resolve, reject) => {
      fs.readFile(pathname, (error, result) => {
        if (error != null) {
          reject(error)
          return
        }
        resolve(result)
      })
    })
  }
  function readdir(pathname, options) {
    return new Promise((resolve, reject) => {
      fs.readdir(pathname, options, (error, result) => {
        if (error != null) {
          reject(error)
          return
        }
        resolve(result)
      })
    })
  }
  function showOpenDialog(options) {
    return electron.remote.dialog.showOpenDialog(options)
  }
  function getHomePath() {
    return electron.remote.app.getPath('home')
  }
  function writeFile(pathname, blob) {
    return new Promise((resolve, reject) => {
      fs.writeFile(pathname, blob, (error) => {
        if (error != null) {
          reject(error)
          return
        }
        resolve()
      })
    })
  }
  function unlinkFile(pathname) {
    return new Promise((resolve, reject) => {
      fs.unlink(pathname, (error) => {
        if (error != null) {
          reject(error)
          return
        }
        resolve()
      })
    })
  }
  function stat(pathname) {
    return new Promise((resolve, reject) => {
      fs.stat(pathname, (error, stats) => {
        if (error != null) {
          reject(error)
          return
        }
        resolve(stats)
      })
    })
  }
  function mkdir(pathname) {
    return new Promise((resolve, reject) => {
      fs.mkdir(pathname, { recursive: true }, (error) => {
        if (error != null) {
          reject(error)
          return
        }
        resolve()
      })
    })
  }

  async function readFileType(pathname) {
    const buffer = readChunk.sync(pathname, 0, 4100)
    return readFileTypeFromBuffer(buffer)
  }

  async function readFileTypeFromBuffer(buffer) {
    const { mime } = await FileType.fromBuffer(buffer)
    return mime
  }

  function parseCSON(value) {
    return CSON.parse(value)
  }

  function stringifyCSON(value) {
    return CSON.stringify(value)
  }

  function openNewWindow(options) {
    return new electron.remote.BrowserWindow(options)
  }

  function openContextMenu(options) {
    const { Menu } = electron.remote
    const menu = Menu.buildFromTemplate(options.menuItems)
    menu.popup()
  }

  function getPathByName(name) {
    const { app } = electron.remote
    if (name === 'app') {
      return app.getAppPath()
    }
    return app.getPath(name)
  }

  function addIpcListener(channel, listener) {
    const { ipcRenderer } = electron
    ipcRenderer.on(channel, listener)
  }

  function removeIpcListener(channel, listener) {
    const { ipcRenderer } = electron
    ipcRenderer.removeListener(channel, listener)
  }

  function removeAllIpcListeners(channel) {
    const { ipcRenderer } = electron
    ipcRenderer.removeListener(channel)
  }

  function setAsDefaultProtocolClient(protocol) {
    return electron.remote.app.setAsDefaultProtocolClient(protocol)
  }

  function removeAsDefaultProtocolClient(protocol) {
    return electron.remote.app.removeAsDefaultProtocolClient(protocol)
  }

  function isDefaultProtocolClient(protocol) {
    return electron.remote.app.isDefaultProtocolClient(protocol)
  }
  function getWebContentsById(id) {
    return electron.remote.webContents.fromId(id)
  }

  function setTrafficLightPosition(position) {
    electron.remote.getCurrentWindow().setTrafficLightPosition(position)
  }

  function convertHtmlStringToPdfBlob(htmlString, printOptions) {
    return new Promise((resolve, reject) => {
      const encodedStr = encodeURIComponent(htmlString)
      const { BrowserWindow } = electron.remote
      const windowOptions = {
        webPreferences: {
          nodeIntegration: false,
          webSecurity: false,
          javascript: false,
        },
        show: false,
      }
      const browserWindow = new BrowserWindow(windowOptions)
      browserWindow.loadURL('data:text/html;charset=UTF-8,' + encodedStr)

      browserWindow.webContents.on('did-finish-load', async () => {
        try {
          const pdfFileBuffer = await browserWindow.webContents.printToPDF(
            printOptions
          )
          const blob = new Blob([pdfFileBuffer], {
            type: 'application/pdf',
          })
          resolve(blob)
        } catch (error) {
          reject(error)
        } finally {
          browserWindow.destroy()
        }
      })
    })
  }

  window.__ELECTRON_ONLY__ = {}
  window.__ELECTRON_ONLY__.openExternal = openExternal
  window.__ELECTRON_ONLY__.readFile = readFile
  window.__ELECTRON_ONLY__.showOpenDialog = showOpenDialog
  window.__ELECTRON_ONLY__.getHomePath = getHomePath
  window.__ELECTRON_ONLY__.writeFile = writeFile
  window.__ELECTRON_ONLY__.unlinkFile = unlinkFile
  window.__ELECTRON_ONLY__.readdir = readdir
  window.__ELECTRON_ONLY__.stat = stat
  window.__ELECTRON_ONLY__.mkdir = mkdir
  window.__ELECTRON_ONLY__.readFileType = readFileType
  window.__ELECTRON_ONLY__.readFileTypeFromBuffer = readFileTypeFromBuffer
  window.__ELECTRON_ONLY__.parseCSON = parseCSON
  window.__ELECTRON_ONLY__.stringifyCSON = stringifyCSON
  window.__ELECTRON_ONLY__.openNewWindow = openNewWindow
  window.__ELECTRON_ONLY__.openContextMenu = openContextMenu
  window.__ELECTRON_ONLY__.getPathByName = getPathByName
  window.__ELECTRON_ONLY__.addIpcListener = addIpcListener
  window.__ELECTRON_ONLY__.removeIpcListener = removeIpcListener
  window.__ELECTRON_ONLY__.removeAllIpcListeners = removeAllIpcListeners
  window.__ELECTRON_ONLY__.setAsDefaultProtocolClient = setAsDefaultProtocolClient
  window.__ELECTRON_ONLY__.removeAsDefaultProtocolClient = removeAsDefaultProtocolClient
  window.__ELECTRON_ONLY__.isDefaultProtocolClient = isDefaultProtocolClient
  window.__ELECTRON_ONLY__.getWebContentsById
  window.__ELECTRON_ONLY__.setTrafficLightPosition = setTrafficLightPosition
  window.__ELECTRON_ONLY__.convertHtmlStringToPdfBlob = convertHtmlStringToPdfBlob
})()
