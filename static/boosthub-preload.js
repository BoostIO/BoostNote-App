/* eslint-disable @typescript-eslint/no-var-requires */
const { ipcRenderer, remote } = require('electron')
const { parse } = require('url')

function sendToHost(channel, ...args) {
  ipcRenderer.sendToHost(channel, ...args)
}

function addHostListener(channel, listener) {
  ipcRenderer.addListener(channel, listener)
}

function addHostListenerOnce(channel, listener) {
  ipcRenderer.once(channel, listener)
}

function removeHostListener(channel, listener) {
  ipcRenderer.removeListener(channel, listener)
}

function removeAllHostListeners(channel) {
  ipcRenderer.removeAllListeners(channel)
}

function openInBrowser(url) {
  const { protocol } = parse(url)
  switch (protocol) {
    case 'http:':
    case 'https:':
      remote.shell.openExternal(url)
      return
    default:
      console.warn(`${protocol} protocol is not supported`)
  }
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

function findInPage(text, options) {
  const webContents = remote.getCurrentWebContents()
  if (webContents) {
    return webContents.findInPage(text, options)
  }
}

function stopFindInPage(action) {
  const webContents = remote.getCurrentWebContents()
  if (webContents) {
    return webContents.stopFindInPage(action)
  }
}

function foundInPageListener(callback) {
  return (_, result) => {
    callback(result.matches)
  }
}

function addFoundInPageListener(callback) {
  const webContents = remote.getCurrentWebContents()
  if (webContents != null) {
    webContents.on('found-in-page', foundInPageListener(callback))
  }
}

function removeFoundInPageListener(callback) {
  const webContents = remote.getCurrentWebContents()
  if (webContents) {
    return webContents.removeListener(
      'found-in-page',
      foundInPageListener(callback)
    )
  }
}

window.__ELECTRON_ONLY__ = {}
window.__ELECTRON_ONLY__.sendToHost = sendToHost
window.__ELECTRON_ONLY__.convertHtmlStringToPdfBlob = convertHtmlStringToPdfBlob

window.__ELECTRON_ONLY__.addHostListener = addHostListener
window.__ELECTRON_ONLY__.removeHostListener = removeHostListener
window.__ELECTRON_ONLY__.removeAllHostListeners = removeAllHostListeners
window.__ELECTRON_ONLY__.addHostListenerOnce = addHostListenerOnce
window.__ELECTRON_ONLY__.openInBrowser = openInBrowser
window.__ELECTRON_ONLY__.findInPage = findInPage
window.__ELECTRON_ONLY__.stopFindInPage = stopFindInPage
window.__ELECTRON_ONLY__.addFoundInPageListener = addFoundInPageListener
window.__ELECTRON_ONLY__.removeFoundInPageListener = removeFoundInPageListener

const handler = (event) => {
  event.preventDefault()
  event.stopPropagation()
  sendToHost('open-context-menu')
}
window.addEventListener('contextmenu', handler)
window.__ELECTRON_ONLY__.globalContextMenuIsConfigured = true
