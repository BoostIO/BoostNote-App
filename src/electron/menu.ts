import { app, shell, MenuItemConstructorOptions } from 'electron'
import { checkForUpdates } from './updater'

const mac = process.platform === 'darwin'
// const linux = process.platform === 'linux'
const preferencesMenuOption: MenuItemConstructorOptions = {
  label: 'Preferences',
  accelerator: 'Command+,',
  click: async (_menuItem, browserWindow) => {
    if (browserWindow == null) {
      console.warn('Browser window for the menu item does not exist.')
      return
    }
    browserWindow.webContents.send('preferences')
  },
}

export const template: MenuItemConstructorOptions[] = [
  // { role: 'appMenu' }
  ...(mac
    ? [
        {
          label: app.getName(),
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            preferencesMenuOption,
            { type: 'separator' },
            {
              label: 'Check For Updates',
              click: checkForUpdates,
            },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ] as MenuItemConstructorOptions[],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: mac
      ? [
          {
            type: 'normal',
            label: 'New Note',
            click: async (_menuItem, browserWindow) => {
              if (browserWindow == null) {
                console.warn('Browser window for the menu item does not exist.')
                return
              }
              browserWindow.webContents.send('new-note')
            },
            accelerator: 'Cmd + N',
          },
          { type: 'separator' },
          { role: 'close' },
        ]
      : ([
          {
            type: 'normal',
            label: 'New Note',
            click: async (_menuItem, browserWindow) => {
              if (browserWindow == null) {
                console.warn('Browser window for the menu item does not exist.')
                return
              }
              browserWindow.webContents.send('new-note')
            },
            accelerator: 'Ctrl + N',
          },
          { type: 'separator' },
          {
            label: 'Check For Updates',
            click: checkForUpdates,
          },
          { type: 'separator' },
          preferencesMenuOption,
          { type: 'separator' },
          { role: 'quit' },
        ] as MenuItemConstructorOptions[]),
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { type: 'separator' },
      {
        type: 'normal',
        label: 'Search',
        click: async (_menuItem, browserWindow) => {
          if (browserWindow == null) {
            console.warn('Browser window for the menu item does not exist.')
            return
          }
          browserWindow.webContents.send('search')
        },
        accelerator: mac ? 'Cmd + P' : 'Ctrl + P',
      },
      { type: 'separator' },
      ...(mac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
            },
          ]
        : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
    ] as MenuItemConstructorOptions[],
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ] as MenuItemConstructorOptions[],
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(mac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' },
          ]
        : [{ role: 'close' }]),
    ] as MenuItemConstructorOptions[],
  },
  {
    label: 'Community',
    submenu: [
      {
        label: 'GitHub',
        click: async () => {
          await shell.openExternal('https://github.com/BoostIO/Boostnote.next')
        },
      },
      {
        label: 'Slack',
        click: async () => {
          await shell.openExternal(
            'https://join.slack.com/t/boostnote-group/shared_invite/zt-cun7pas3-WwkaezxHBB1lCbUHrwQLXw'
          )
        },
      },
      {
        label: 'IssueHunt',
        click: async () => {
          await shell.openExternal(
            'https://issuehunt.io/r/BoostIo/Boostnote.next'
          )
        },
      },
      {
        label: 'Twitter',
        click: async () => {
          await shell.openExternal('https://twitter.com/boostnoteapp')
        },
      },
      {
        label: 'Facebook',
        click: async () => {
          await shell.openExternal('https://www.facebook.com/groups/boostnote/')
        },
      },
      {
        label: 'Reddit',
        click: async () => {
          await shell.openExternal('https://www.reddit.com/r/Boostnote/')
        },
      },
    ] as MenuItemConstructorOptions[],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          await shell.openExternal('https://boosthub.io')
        },
      },
    ] as MenuItemConstructorOptions[],
  },
]
