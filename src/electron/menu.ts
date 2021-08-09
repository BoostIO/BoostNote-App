import {
  app,
  BrowserWindow,
  MenuItem,
  MenuItemConstructorOptions,
  shell,
} from 'electron'
import { checkForUpdates } from './updater'
import { createEmitIpcMenuItemHandler } from './ipc'

const mac = process.platform === 'darwin'

function createSwitchWorkspaceHandler(index: number) {
  return (_menu: MenuItem, browserWindow?: BrowserWindow) => {
    if (browserWindow == null) {
      console.warn(
        `Failed to emit \`switch-workspace\` ipc event because the browser window for menu item is missing`
      )
      return
    }
    browserWindow.webContents.send('switch-workspace', index)
  }
}

export function getTemplateFromKeymap(
  keymap: Map<string, string>
): MenuItemConstructorOptions[] {
  return [
    ...(mac
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              {
                label: 'Preferences',
                accelerator: 'Cmd+,',
                click: createEmitIpcMenuItemHandler('preferences'),
              },
              { type: 'separator' },
              {
                label: 'Add Space',
                click: createEmitIpcMenuItemHandler('create-cloud-space'),
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
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ] as MenuItemConstructorOptions[],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: mac
        ? [
            {
              type: 'normal',
              label: 'New Note',
              click: createEmitIpcMenuItemHandler('new-note'),
              accelerator: 'Cmd + N',
            },
            {
              type: 'normal',
              label: 'New Folder',
              click: createEmitIpcMenuItemHandler('new-folder'),
              accelerator: 'Cmd + Shift + N',
            },
            { type: 'separator' },
            {
              type: 'normal',
              label: 'Save As',
              click: createEmitIpcMenuItemHandler('save-as'),
              accelerator: keymap.get('editorSaveAs'),
            },
            { type: 'separator' },
            { role: 'close' },
          ]
        : ([
            {
              type: 'normal',
              label: 'New Note',
              click: createEmitIpcMenuItemHandler('new-note'),
              accelerator: 'Ctrl + N',
            },
            {
              type: 'normal',
              label: 'New Folder',
              click: createEmitIpcMenuItemHandler('new-folder'),
              accelerator: 'Ctrl + Shift + N',
            },
            { type: 'separator' },
            {
              type: 'normal',
              label: 'Save As',
              click: createEmitIpcMenuItemHandler('save-as'),
              accelerator: keymap.get('editorSaveAs'),
            },
            { type: 'separator' },
            {
              label: 'Add Space',
              click: createEmitIpcMenuItemHandler('create-cloud-space'),
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
              click: createEmitIpcMenuItemHandler('preferences'),
            },
            { type: 'separator' },
            { role: 'quit' },
          ] as MenuItemConstructorOptions[]),
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Format',
          type: 'submenu',
          submenu: [
            {
              type: 'normal',
              label: 'Bold',
              click: createEmitIpcMenuItemHandler('apply-bold-style'),
              accelerator: mac ? 'Cmd + B' : 'Ctrl + B',
            },
            {
              type: 'normal',
              label: 'Italic',
              click: createEmitIpcMenuItemHandler('apply-italic-style'),
              accelerator: mac ? 'Cmd + I' : 'Ctrl + I',
            },
          ],
        },
        { type: 'separator' },
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
          accelerator: keymap.get('toggleGlobalSearch'),
        },
        // {
        //   type: 'normal',
        //   label: 'Toggle Bookmark',
        //   click: createEmitIpcMenuItemHandler('toggle-bookmark'),
        //   accelerator: mac ? 'Cmd + D' : 'Ctrl + D',
        // },
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
    {
      label: 'View',
      submenu: [
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
        // {
        //   type: 'normal',
        //   label: 'Focus On Side Navigator',
        //   click: createEmitIpcMenuItemHandler('focus-side-navigator'),
        //   accelerator: mac ? 'Cmd + 0' : 'Ctrl + 0',
        // },
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
          accelerator: keymap.get('togglePreviewMode'),
        },
        {
          type: 'normal',
          label: 'Toggle Split Edit Mode',
          click: createEmitIpcMenuItemHandler('toggle-split-edit-mode'),
          accelerator: keymap.get('toggleSplitEditMode'),
        },
        { type: 'separator' },
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
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
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
            await shell.openExternal(
              'https://github.com/BoostIO/Boostnote.next'
            )
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
            await shell.openExternal(
              'https://www.facebook.com/groups/boostnote/'
            )
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
}
