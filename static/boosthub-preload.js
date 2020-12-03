/* eslint-disable @typescript-eslint/no-var-requires */
const { ipcRenderer, remote } = require('electron')

function sendToHost(channel, ...args) {
  ipcRenderer.sendToHost(channel, ...args)
}

function addHostListener(channel, listener) {
  ipcRenderer.addListener(channel, listener)
}

function removeHostListener(channel, listener) {
  ipcRenderer.removeListener(channel, listener)
}

function removeAllHostListeners(channel) {
  ipcRenderer.removeAllListeners(channel)
}

function convertHtmlStringToPdfBlob(htmlString, printOptions) {
  return new Promise((resolve, reject) => {
    const encodedStr = encodeURIComponent(htmlString)
    const { BrowserWindow } = remote
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
window.__ELECTRON_ONLY__.sendToHost = sendToHost
window.__ELECTRON_ONLY__.convertHtmlStringToPdfBlob = convertHtmlStringToPdfBlob

window.__ELECTRON_ONLY__.addHostListener = addHostListener
window.__ELECTRON_ONLY__.removeHostListener = removeHostListener
window.__ELECTRON_ONLY__.removeAllHostListeners = removeAllHostListeners
