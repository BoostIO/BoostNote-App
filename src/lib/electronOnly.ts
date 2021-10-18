import { Stats, Dirent } from 'fs'
import {
  BrowserWindowConstructorOptions,
  BrowserWindow,
  MenuItemConstructorOptions,
  IpcRendererEvent,
  WebContents,
  PrintToPDFOptions,
  FindInPageOptions,
} from 'electron'
import { CookiesSetDetails, CookiesGetFilter, Cookie } from 'electron/main'
import { Got } from 'got'

const __ELECTRON_ONLY__: {
  readFile(pathname: string): Promise<string | Buffer>
  readdir(
    pathname: string,
    options?: { withFileTypes?: false }
  ): Promise<string[]>
  readdir(pathname: string, options: { withFileTypes: true }): Promise<Dirent[]>
  writeFile(pathname: string, data: string | Buffer): Promise<void>
  unlinkFile(pathname: string): Promise<void>
  stat(pathname: string): Promise<Stats>
  mkdir(pathname: string): Promise<void>
  readFileType(pathname: string): Promise<string>
  readFileTypeFromBuffer(
    buffer: Buffer | Uint8Array | ArrayBuffer
  ): Promise<string>
  showOpenDialog(
    options: Electron.OpenDialogOptions
  ): Promise<Electron.OpenDialogReturnValue>
  showSaveDialog(
    options: Electron.SaveDialogOptions
  ): Promise<Electron.SaveDialogReturnValue>
  openExternal(url: string): void
  openPath(fullPath: string, folderOnly?: boolean): void
  openNewWindow(
    url?: string,
    options?: BrowserWindowConstructorOptions
  ): BrowserWindow
  openContextMenu(options: { menuItems: MenuItemConstructorOptions[] }): void
  getPathByName(name: string): string
  addIpcListener(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => void
  ): void
  sendIpcMessage(channel: string, data: any[]): void
  removeIpcListener(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => void
  ): void
  removeAllIpcListeners(channel: string): void
  setAsDefaultProtocolClient(protocol: string): boolean
  removeAsDefaultProtocolClient(protocol: string): boolean
  isDefaultProtocolClient(protocol: string): boolean
  getWebContentsById(id: number): WebContents
  setTrafficLightPosition(position: { x: number; y: number }): void
  convertHtmlStringToPdfBuffer(
    htmlString: string,
    printOptions: PrintToPDFOptions
  ): Promise<Buffer>
  setCookie(cookieDetails: CookiesSetDetails): Promise<void>
  getCookie(filter: CookiesGetFilter): Promise<Cookie[]>
  removeCookie(url: string, name: string): Promise<void>
  setBadgeCount(count: number): boolean
  findInPage(text: string, options?: FindInPageOptions): number
  stopFindInPage(
    action: 'clearSelection' | 'keepSelection' | 'activateSelection'
  ): void
  signInBroadcast(): void
  got: Got
} = (window as any).__ELECTRON_ONLY__

const {
  readFile,
  readdir,
  writeFile,
  unlinkFile,
  stat,
  mkdir,
  readFileType,
  readFileTypeFromBuffer,
  showOpenDialog,
  showSaveDialog,
  openExternal,
  openPath,
  openNewWindow,
  openContextMenu,
  getPathByName,
  addIpcListener,
  sendIpcMessage,
  removeIpcListener,
  removeAllIpcListeners,
  setAsDefaultProtocolClient,
  removeAsDefaultProtocolClient,
  isDefaultProtocolClient,
  getWebContentsById,
  setTrafficLightPosition,
  convertHtmlStringToPdfBuffer,
  setCookie,
  getCookie,
  removeCookie,
  setBadgeCount,
  findInPage,
  stopFindInPage,
  signInBroadcast,
  got,
} = __ELECTRON_ONLY__ || {}

async function readFileAsString(pathname: string) {
  const result = await readFile(pathname)

  return result.toString()
}

async function prepareDirectory(pathname: string) {
  try {
    const stats = await stat(pathname)
    if (!stats.isDirectory()) {
      throw new Error(
        `Failed to prepare a directory because ${pathname} is a file`
      )
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      await mkdir(pathname)
    } else {
      throw error
    }
  }
}

export {
  readFile,
  readFileAsString,
  readdir,
  writeFile,
  unlinkFile,
  stat,
  mkdir,
  prepareDirectory,
  readFileType,
  readFileTypeFromBuffer,
  showOpenDialog,
  showSaveDialog,
  openExternal,
  openPath,
  openNewWindow,
  openContextMenu,
  getPathByName,
  addIpcListener,
  sendIpcMessage,
  removeIpcListener,
  removeAllIpcListeners,
  setAsDefaultProtocolClient,
  removeAsDefaultProtocolClient,
  isDefaultProtocolClient,
  getWebContentsById,
  setTrafficLightPosition,
  convertHtmlStringToPdfBuffer,
  setCookie,
  getCookie,
  removeCookie,
  setBadgeCount,
  findInPage,
  stopFindInPage,
  signInBroadcast,
  got,
}
