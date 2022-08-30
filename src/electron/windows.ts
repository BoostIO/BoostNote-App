import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
  MenuItemConstructorOptions,
  autoUpdater,
} from 'electron'
import path from 'path'
import { dev } from './consts'
import { getTemplateFromKeymap } from './menu'

const windows = new Set<BrowserWindow>()

export function getWindows() {
  return [...windows]
}

function applyMenuTemplate(template: MenuItemConstructorOptions[]) {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

const MAC = process.platform === 'darwin'

export function createAWindow(
  url: string,
  options?: BrowserWindowConstructorOptions
) {
  const windowOptions: BrowserWindowConstructorOptions = {
    webPreferences: {
      nodeIntegration: true,
      webSecurity: !dev,
      webviewTag: true,
      enableRemoteModule: true,
      contextIsolation: false,
      preload: dev
        ? path.join(app.getAppPath(), '../static/main-preload.js')
        : path.join(app.getAppPath(), './compiled/app/static/main-preload.js'),
    },
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 630,
    show: false,
    icon: path.join(app.getAppPath(), '../static/logo.png'),
    ...options,
  }

  const window = new BrowserWindow(windowOptions)
  windows.add(window)

  window.loadURL(url)
  window.once('ready-to-show', () => {
    window.show()
  })

  applyMenuTemplate(getTemplateFromKeymap())

  if (MAC) {
    window.on('close', (event) => {
      if (getWindows().length > 1) {
        return
      }
      event.preventDefault()
      window.hide()
    })

    app.on('before-quit', () => {
      window.removeAllListeners()
    })

    autoUpdater.on('before-quit-for-update', () => {
      window.removeAllListeners()
    })
  }

  window.on('closed', () => {
    windows.delete(window)
  })

  return window
}
