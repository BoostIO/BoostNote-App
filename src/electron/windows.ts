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

const keymap = new Map<string, string>([
  ['toggleGlobalSearch', 'Ctrl + P'],
  ['toggleSplitEditMode', 'Ctrl + \\'],
  ['togglePreviewMode', 'Ctrl + E'],
  ['editorSaveAs', 'Ctrl + S'],
])

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
    ...options,
  }

  const window = new BrowserWindow(windowOptions)
  windows.add(window)

  window.loadURL(url)

  applyMenuTemplate(getTemplateFromKeymap(keymap))

  if (MAC) {
    window.on('close', (event) => {
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
