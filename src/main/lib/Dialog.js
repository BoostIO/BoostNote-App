const { remote } = require('electron')
const { dialog } = remote

export function showMessageBox (...args) {
  dialog.showMessageBox(remote.getCurrentWindow(), ...args)
}

export default {
  showMessageBox
}
