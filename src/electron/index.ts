import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  protocol,
  autoUpdater,
  webContents,
} from 'electron'
import path from 'path'
import url from 'url'
import { getTemplateFromKeymap } from './menu'
import { dev } from './consts'

const windows = new Set<BrowserWindow>()
const MAC = process.platform === 'darwin'

// single instance lock
const singleInstance = app.requestSingleInstanceLock()

const electronFrontendUrl = dev
  ? 'http://localhost:3000/app'
  : url.format({
      pathname: path.join(app.getAppPath(), './compiled/index.html'),
      protocol: 'file',
      slashes: true,
    })

const keymap = new Map<string, string>([
  ['toggleGlobalSearch', 'Ctrl + P'],
  ['toggleSplitEditMode', 'Ctrl + \\'],
  ['togglePreviewMode', 'Ctrl + E'],
  ['editorSaveAs', 'Ctrl + S'],
])

function applyMenuTemplate(template: MenuItemConstructorOptions[]) {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createAWindow(url: string, options?: BrowserWindowConstructorOptions) {
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

// single instance lock handler
if (!singleInstance) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const allWindows = [...windows.values()]
    const mainWindow = allWindows[0]
    if (allWindows.length >= 1) {
      if (mainWindow != null) {
        if (!mainWindow.isVisible()) {
          mainWindow.show()
        } else {
          mainWindow.focus()
        }
      }
    }

    // todo: [komediruzecki-2021-10-21] Can/do we want to handle this, what if multiple windows
    if (!MAC) {
      let urlWithBoostNoteProtocol
      for (const arg of argv) {
        if (/^boostnote:\/\//.test(arg)) {
          urlWithBoostNoteProtocol = arg
          break
        }
      }
      if (urlWithBoostNoteProtocol != null && mainWindow != null) {
        mainWindow.webContents.send(
          'open-boostnote-url',
          urlWithBoostNoteProtocol
        )
      }
    }
  })
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
  if (windows.size === 0) {
    const mainWindow = createAWindow(electronFrontendUrl)
    windows.add(mainWindow)
  } else {
    const allWindows = [...windows.values()]
    const mainWindow = allWindows[0]
    if (mainWindow != null) {
      mainWindow.show()
      mainWindow.focus()
    }
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  /* This file protocol registration will be needed from v9.x.x for PDF export feature */
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''))
    callback(pathname)
  })
  const mainWindow = createAWindow(electronFrontendUrl)
  windows.add(mainWindow)

  ipcMain.on('menuAcceleratorChanged', (_, args) => {
    if (args.length != 2) {
      return
    }
    const menuItemId = args[0]
    const newAcceleratorShortcut = args[1] == null ? undefined : args[1]

    keymap.set(menuItemId, newAcceleratorShortcut)
    applyMenuTemplate(getTemplateFromKeymap(keymap))
  })

  // multiple windows support
  ipcMain.on('new-window-event', (args: any) => {
    const url =
      args.url == null
        ? electronFrontendUrl
        : `${electronFrontendUrl}?url=${args.url}`
    const newWindow = createAWindow(url, args.windowOptions)
    windows.add(newWindow)

    return newWindow
  })

  ipcMain.on('sign-in-event', (windowId?: any, webviewContentsId?: any) => {
    for (const webContent of webContents.getAllWebContents()) {
      if (webContent.id === windowId || webContent.id === webviewContentsId) {
        continue
      }
      webContent.reload()
    }
  })

  ipcMain.on('sign-out-event', (windowId?: any) => {
    windows.forEach((window) => {
      if (window.id !== windowId) {
        window.close()
      }
    })
  })

  app.on('open-url', (_event, url) => {
    mainWindow!.webContents.send('open-boostnote-url', url)
  })
})
