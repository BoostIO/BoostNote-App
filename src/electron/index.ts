import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  protocol,
  session,
} from 'electron'
import path from 'path'
import url from 'url'
import { template } from './menu'
import { dev } from './consts'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null = null
const MAC = process.platform === 'darwin'

// single instance lock
const singleInstance = app.requestSingleInstanceLock()

function recreateMenu(template: MenuItemConstructorOptions[]) {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createMainWindow() {
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
  }

  const window = new BrowserWindow(windowOptions)

  if (dev) {
    window.loadURL(`http://localhost:3000/app`, {
      userAgent: session.defaultSession.getUserAgent() + ` BoostNote`,
    })
  } else {
    window.loadURL(
      url.format({
        pathname: path.join(app.getAppPath(), './compiled/index.html'),
        protocol: 'file',
        slashes: true,
      })
    )
  }

  recreateMenu(template)

  if (MAC) {
    window.on('close', (event) => {
      event.preventDefault()
      window.hide()
    })

    app.on('before-quit', () => {
      window.removeAllListeners()
    })
  }

  window.on('closed', () => {
    mainWindow = null
  })

  return window
}

// single instance lock handler
if (!singleInstance) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show()
      mainWindow.focus()
    }

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
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  /* This file protocol registration will be needed from v9.x.x for PDF export feature */
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''))
    callback(pathname)
  })
  mainWindow = createMainWindow()

  ipcMain.on('menuAcceleratorChanged', (_, args) => {
    if (args.length != 2) {
      return
    }
    const menuItemId = args[0]
    const newAcceleratorShortcut =
      args[1] == null
        ? undefined
        : MAC
        ? args[1].replace('Ctrl', 'Cmd')
        : args[1]

    function updateTemplate(
      template: MenuItemConstructorOptions[],
      mainIndex: number,
      subMenuIndex: number,
      accelerator: string | undefined
    ) {
      if (
        template != null &&
        template[mainIndex] &&
        template[mainIndex].submenu != null &&
        template[mainIndex].submenu
      ) {
        const submenuItem = template[mainIndex].submenu
        if (submenuItem) {
          submenuItem[subMenuIndex].accelerator = accelerator
        }
      }
    }

    switch (menuItemId) {
      case 'toggleGlobalSearch':
        updateTemplate(template, 1, 9, newAcceleratorShortcut)
        break
      case 'togglePreviewMode':
        updateTemplate(template, 2, 6, newAcceleratorShortcut)
        break
      case 'toggleSplitEditMode':
        updateTemplate(template, 2, 7, newAcceleratorShortcut)
        break
      case 'editorSaveAs':
        updateTemplate(template, 0, MAC ? 2 : 3, newAcceleratorShortcut)
        break
    }

    recreateMenu(template)
  })

  app.on('open-url', (_event, url) => {
    mainWindow!.webContents.send('open-boostnote-url', url)
  })
})
