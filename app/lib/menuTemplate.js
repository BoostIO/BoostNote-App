const { app, shell, BrowserWindow } = require('electron')

const OSX = process.platform === 'darwin'

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Note',
        accelerator: 'CmdOrCtrl + N',
        click: e => {
          if (global.windows.main) {
            global.windows.main.webContents.send('new-note')
          }
        }
      },
      {
        label: 'New Folder',
        accelerator: 'CmdOrCtrl + Shift + N',
        click: e => {
          if (global.windows.main) {
            global.windows.main.webContents.send('new-folder')
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Print...',
        accelerator: 'CmdOrCtrl + P',
        click: e => {
          if (global.windows.main) {
            global.windows.main.webContents.send('print')
          }
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        label: 'Delete',
        accelerator: OSX ? 'Backspace' : 'Delete',
        click: e => {
          const window = BrowserWindow.getFocusedWindow()
          if (window && global.windows.main && window === global.windows.main) {
            global.windows.main.webContents.send('delete')
          }
        }
      },
      {
        role: 'selectall'
      },
      {
        type: 'separator'
      },
      {
        label: 'Find',
        submenu: [
          {
            label: 'Note List Search...',
            accelerator: 'CmdOrCtrl + Shift + F',
            click: e => {
              if (global.windows.main) {
                global.windows.main.webContents.send('focus-search')
              }
            }
          },
          {
            label: 'Find...',
            accelerator: 'CmdOrCtrl + F',
            click: e => {
              if (global.windows.main) {
                global.windows.main.webContents.send('find')
              }
            }
          }
        ]
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        role: 'reload'
      },
      {
        role: 'toggledevtools'
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: e => { shell.openExternal('https://github.com/Sarah-Seo/Inpad') }
      }
    ]
  }
]

if (OSX) {
  template.unshift({
    label: app.getName(),
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences',
        accelerator: 'CmdOrCtrl + ,',
        click: e => {
          if (global.windows.main) {
            global.windows.main.webContents.send('open-preferences')
          }
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // Edit menu.
  template[2].submenu.push(
    {
      label: 'Speech',
      submenu: [
        {
          role: 'startspeaking'
        },
        {
          role: 'stopspeaking'
        }
      ]
    }
  )
  // Window menu.
  template[4].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]
}

module.exports = template
