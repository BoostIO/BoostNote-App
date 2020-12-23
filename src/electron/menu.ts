import { app, shell, MenuItemConstructorOptions } from 'electron'
import { checkForUpdates } from './updater'
import { createEmitIpcMenuItemHandler } from './ipc'

const mac = process.platform === 'darwin'

export const template: MenuItemConstructorOptions[] = [
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
            accelerator: 'Cmd + S',
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
            accelerator: 'Ctrl + S',
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
        label: 'Switch Workspace',
        submenu: [],
      },
      {
        type: 'normal',
        label: 'Focus On Side Navigator',
        click: createEmitIpcMenuItemHandler('focus-side-navigator'),
        accelerator: mac ? 'Cmd + 0' : 'Ctrl + 0',
      },
      {
        type: 'normal',
        label: 'Toggle Side Navigator',
        click: createEmitIpcMenuItemHandler('toggle-side-navigator'),
        accelerator: mac ? 'Cmd + Shift + 0' : 'Ctrl + Shift + 0',
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
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      // { role: 'resetzoom' },
      // { role: 'zoomin' },
      // { role: 'zoomout' },
      // { type: 'separator' },
      { role: 'togglefullscreen' },
    ] as MenuItemConstructorOptions[],
  },
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
