import { app, shell } from 'electron'
import { checkForUpdates } from './updater'

const mac = process.platform === 'darwin'
// const linux = process.platform === 'linux'

export const template: any[] = [
  // { role: 'appMenu' }
  ...(mac
    ? [
        {
          label: app.getName(),
          submenu: [
            { role: 'about' },
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
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: mac
      ? [{ role: 'close' }]
      : [
          {
            label: 'Check For Updates',
            click: checkForUpdates,
          },
          { type: 'separator' },
          {
            label: 'For Team',
            click: async () => {
              await shell.openExternal('https://hub.boostio.co/')
            },
          },
          { type: 'separator' },
          { role: 'quit' },
        ],
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
    ],
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
    ],
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
    ],
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
    ],
  },

  {
    label: 'For Team',
    submenu: [
      {
        label: 'BoostHub',
        click: async () => {
          await shell.openExternal('https://boosthub.io/')
        },
      },
    ],
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
    ],
  },
]
