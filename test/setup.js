function dummy() {
  // Don't do anything
}

window.__ELECTRON_ONLY__ = {
  readFile: dummy,
  readdir: dummy,
  writeFile: dummy,
  unlinkFile: dummy,
  stat: dummy,
  mkdir: dummy,
  readFileType: dummy,
  readFileTypeFromBuffer: dummy,
  showOpenDialog: dummy,
  showSaveDialog: dummy,
  openExternal: dummy,
  openNewWindow: dummy,
  openContextMenu: dummy,
  getPathByName: dummy,
  addIpcListener: dummy,
  sendIpcMessage: dummy,
  removeIpcListener: dummy,
  removeAllIpcListeners: dummy,
  setAsDefaultProtocolClient: dummy,
  removeAsDefaultProtocolClient: dummy,
  isDefaultProtocolClient: dummy,
  getWebContentsById: dummy,
  setTrafficLightPosition: dummy,
  convertHtmlStringToPdfBuffer: dummy,
  setCookie: dummy,
  getCookie: dummy,
  removeCookie: dummy,
  got: dummy,
}
