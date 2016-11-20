const { remote } = require('electron')
const { Menu } = remote

export function open (template) {
  let menu = Menu.buildFromTemplate(template)
  menu.popup(remote.getCurrentWindow())
}

export default {
  open
}
