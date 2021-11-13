import {
  app,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  protocol,
  webContents,
} from 'electron'
import path from 'path'
import url from 'url'
import { getTemplateFromKeymap } from './menu'
import { dev } from './consts'
import { createAWindow, getWindows } from './windows'

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

const singleInstance = app.requestSingleInstanceLock()
if (!singleInstance) {
  app.quit()
} else {
  app.on('second-instance', (_event) => {
    const firstWindow = getWindows()[0]
    if (firstWindow == null) {
      createAWindow(electronFrontendUrl)
    } else {
      if (firstWindow.isVisible()) {
        firstWindow.show()
      }
      firstWindow.focus()
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
  const windows = getWindows()
  const firstWindow = windows[0]
  if (firstWindow != null) {
    firstWindow.show()
    firstWindow.focus()
  } else {
    createAWindow(electronFrontendUrl)
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  /* This file protocol registration will be needed from v9.x.x for PDF export feature */
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''))
    callback(pathname)
  })

  createAWindow(electronFrontendUrl)

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
    getWindows().forEach((window) => {
      if (window.id !== windowId) {
        window.close()
      }
    })
  })

  app.on('open-url', (_event, url) => {
    getWindows().forEach((window) => {
      window.webContents.send('open-boostnote-url', url)
    })
  })
})
