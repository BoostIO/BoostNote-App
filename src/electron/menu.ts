import {
  app,
  BrowserWindow,
  MenuItem,
  MenuItemConstructorOptions,
  shell,
} from 'electron'
import { checkForUpdates } from './updater'
import { createEmitIpcMenuItemHandler } from './ipc'
import { createAWindow } from './windows'
import { electronFrontendUrl } from './consts'

const mac = process.platform === 'darwin'

export function getTemplateFromKeymap(): MenuItemConstructorOptions[] {
  const menu: MenuItemConstructorOptions[] = []

  if (mac) {
    menu.push(getMacRootMenu())
  }

  menu.push(getFileMenu())
  menu.push(getEditMenu())
  menu.push(getViewMenu())
  menu.push(getWindowMenu())
  menu.push(getCommunityMenu())
  menu.push({
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          await shell.openExternal('https://boostnote.io')
        },
      },
    ],
  })

  return menu
}

function getMacRootMenu(): MenuItemConstructorOptions {
  return {
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      {
        label: 'Preferences',
        accelerator: 'Cmd+,',
        click: createEmitIpcMenuItemHandler('toggle-settings'),
      },
      { type: 'separator' },
      {
        label: 'Add Space',
        click: () => {
          createAWindow(
            electronFrontendUrl + '?url=https%3A%2F%2Fboostnote.io%2Fcooperate'
          )
        },
      },
      { type: 'separator' },
      {
        label: 'Check For Updates',
        click: checkForUpdates,
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  }
}

function getFileMenu(): MenuItemConstructorOptions {
  const submenuItems: MenuItemConstructorOptions[] = mac
    ? [
        {
          type: 'normal',
          label: 'New Window',
          click: () => {
            createAWindow(electronFrontendUrl)
          },
          accelerator: 'Cmd + Shift + N',
        },
        { type: 'separator' },
        {
          type: 'normal',
          label: 'New Document',
          click: createEmitIpcMenuItemHandler('new-doc'),
          accelerator: 'Cmd + N',
        },
        { type: 'separator' },
        {
          type: 'normal',
          label: 'Save As',
          click: createEmitIpcMenuItemHandler('save-as'),
          accelerator: 'Cmd + S',
        },
        { type: 'separator' },
        { role: 'close' },
      ]
    : [
        {
          type: 'normal',
          label: 'New Window',
          click: () => {
            createAWindow(electronFrontendUrl)
          },
          accelerator: 'Ctrl + Shift + N',
        },
        { type: 'separator' },
        {
          type: 'normal',
          label: 'New Document',
          click: createEmitIpcMenuItemHandler('new-doc'),
          accelerator: 'Ctrl + N',
        },
        { type: 'separator' },
        {
          type: 'normal',
          label: 'Save As',
          click: createEmitIpcMenuItemHandler('save-as'),
          accelerator: 'Ctrl + S',
        },
        { type: 'separator' },
        {
          label: 'Add Space',
          click: () => {
            createAWindow(electronFrontendUrl + '/cooperate')
          },
        },
        { type: 'separator' },
        {
          label: 'Check For Updates',
          click: checkForUpdates,
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'Ctrl+,',
          click: createEmitIpcMenuItemHandler('toggle-settings'),
        },
        { type: 'separator' },
        { role: 'quit' },
      ]

  return {
    label: 'File',
    submenu: submenuItems,
  }
}

function getEditMenu(): MenuItemConstructorOptions {
  const submenuItems: MenuItemConstructorOptions[] = [
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
      click: createEmitIpcMenuItemHandler('search'),
      accelerator: mac ? 'Cmd + P' : 'Ctrl + P',
    },
    { type: 'separator' },
    { role: 'delete' },
    { type: 'separator' },
    { role: 'selectAll' },
  ]
  if (mac) {
    submenuItems.push(
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
      }
    )
  }

  return {
    label: 'Edit',
    submenu: submenuItems,
  }
}

function getViewMenu(): MenuItemConstructorOptions {
  const submenuItems: MenuItemConstructorOptions[] = [
    {
      type: 'submenu',
      label: 'Switch Space',
      submenu: [
        {
          type: 'normal',
          label: 'Switch to First Space',
          accelerator: mac ? 'Cmd + 1' : 'Ctrl + 1',
          click: createSwitchWorkspaceHandler(0),
        },
        {
          type: 'normal',
          label: 'Switch to Second Space',
          accelerator: mac ? 'Cmd + 2' : 'Ctrl + 2',
          click: createSwitchWorkspaceHandler(1),
        },
        {
          type: 'normal',
          label: 'Switch to Third Space',
          accelerator: mac ? 'Cmd + 3' : 'Ctrl + 3',
          click: createSwitchWorkspaceHandler(2),
        },
        {
          type: 'normal',
          label: 'Switch to 4th Space',
          accelerator: mac ? 'Cmd + 4' : 'Ctrl + 4',
          click: createSwitchWorkspaceHandler(3),
        },
        {
          type: 'normal',
          label: 'Switch to 5th Space',
          accelerator: mac ? 'Cmd + 5' : 'Ctrl + 5',
          click: createSwitchWorkspaceHandler(4),
        },
        {
          type: 'normal',
          label: 'Switch to 6th Space',
          accelerator: mac ? 'Cmd + 6' : 'Ctrl + 6',
          click: createSwitchWorkspaceHandler(5),
        },
        {
          type: 'normal',
          label: 'Switch to 7th Space',
          accelerator: mac ? 'Cmd + 7' : 'Ctrl + 7',
          click: createSwitchWorkspaceHandler(6),
        },
        {
          type: 'normal',
          label: 'Switch to 8th Space',
          accelerator: mac ? 'Cmd + 8' : 'Ctrl + 8',
          click: createSwitchWorkspaceHandler(7),
        },
        {
          type: 'normal',
          label: 'Switch to 9th Space',
          accelerator: mac ? 'Cmd + 9' : 'Ctrl + 9',
          click: createSwitchWorkspaceHandler(8),
        },
      ],
    },
    { type: 'separator' },
    {
      type: 'normal',
      label: 'Focus On Editor',
      click: createEmitIpcMenuItemHandler('focus-editor'),
      accelerator: mac ? 'Cmd + J' : 'Ctrl + J',
    },
    {
      type: 'normal',
      label: 'Focus On Title',
      click: createEmitIpcMenuItemHandler('focus-title'),
      accelerator: mac ? 'Cmd +Shift+ J' : 'Ctrl+Shift + J',
    },
    { type: 'separator' },
    {
      type: 'normal',
      label: 'Toggle Preview Mode',
      click: createEmitIpcMenuItemHandler('toggle-preview-mode'),
      accelerator: mac ? 'Cmd + E' : 'Ctrl + E',
    },
    {
      type: 'normal',
      label: 'Toggle Split Edit Mode',
      click: createEmitIpcMenuItemHandler('toggle-split-edit-mode'),
      accelerator: mac ? 'Cmd + \\' : 'Ctrl + \\',
    },
    { type: 'separator' },
    {
      type: 'normal',
      label: 'Reload',
      click: createEmitIpcMenuItemHandler('reload'),
      accelerator: mac ? 'Cmd + R' : 'Ctrl + R',
    },
    { type: 'separator' },
    {
      type: 'submenu',
      label: 'Developer',
      submenu: [
        {
          type: 'normal',
          label: 'Force Reload',
          click: createEmitIpcMenuItemHandler('force-reload'),
          accelerator: mac ? 'Cmd + Shift + R' : 'Ctrl + Shift + R',
        },
        {
          type: 'normal',
          label: 'Toggle Web View Dev Tools',
          click: createEmitIpcMenuItemHandler('toggle-dev-tools'),
          accelerator: mac ? 'Cmd + Alt + I' : 'Ctrl + Alt + I',
        },
        {
          type: 'normal',
          label: 'Toggle Browser Window Dev Tools',
          click: (_menuItem: MenuItem, browserWindow?: BrowserWindow) => {
            if (browserWindow == null) {
              return
            }
            browserWindow.webContents.toggleDevTools()
          },
          accelerator: mac ? 'Cmd + Shift + Alt + I' : 'Ctrl + Shift + Alt + I',
        },
      ],
    },

    { type: 'separator' },
    { role: 'resetZoom' },
    { role: 'zoomIn' },
    { role: 'zoomOut' },
    { type: 'separator' },
    { role: 'togglefullscreen' },
  ]

  return {
    label: 'View',
    submenu: submenuItems,
  }
}

function createSwitchWorkspaceHandler(index: number) {
  return (_menu: MenuItem, browserWindow?: BrowserWindow) => {
    if (browserWindow == null) {
      console.warn(
        `Failed to emit \`switch-space\` ipc event because the browser window for menu item is missing`
      )
      return
    }
    browserWindow.webContents.send('switch-space', index)
  }
}

function getWindowMenu(): MenuItemConstructorOptions {
  const submenuItems: MenuItemConstructorOptions[] = mac
    ? [{ role: 'minimize' }, { type: 'separator' }, { role: 'front' }]
    : [{ role: 'minimize' }]
  return {
    label: 'Window',
    submenu: submenuItems,
  }
}

function getCommunityMenu(): MenuItemConstructorOptions {
  return {
    label: 'Community',
    submenu: [
      {
        label: 'GitHub',
        click: async () => {
          await shell.openExternal('https://github.com/BoostIO/BoostNote-App')
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
    ],
  }
}
