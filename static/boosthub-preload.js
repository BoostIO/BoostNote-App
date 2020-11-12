/* eslint-disable @typescript-eslint/no-var-requires */
const { ipcRenderer } = require('electron')

function sendToHost(channel, ...args) {
  ipcRenderer.sendToHost(channel, ...args)
}
window.__ELECTRON_ONLY__ = {}
window.__ELECTRON_ONLY__.sendToHost = sendToHost
