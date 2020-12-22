import { MenuItem, BrowserWindow } from 'electron'

export function createEmitIpcMenuItemHandler(eventName: string) {
  return function (_menuItem: MenuItem, browserWindow?: BrowserWindow) {
    if (browserWindow == null) {
      console.warn(
        `Failed to emit \`${eventName}\` ipc event because the browser window for menu item is missing`
      )
      return
    }
    browserWindow.webContents.send(eventName)
  }
}
