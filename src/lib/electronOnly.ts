import { Stats, Dirent } from 'fs'
import { JsonValue } from 'type-fest'

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
  getHomePath(): string
  openExternal(url: string): void
  parseCSON(value: string): JsonValue
  stringifyCSON(value: any): string
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
  getHomePath,
  openExternal,
  parseCSON,
  stringifyCSON,
} = __ELECTRON_ONLY__ || {}

async function readFileAsString(pathname: string) {
  const result = await readFile(pathname)

  return result.toString()
}

export {
  readFile,
  readFileAsString,
  readdir,
  writeFile,
  unlinkFile,
  stat,
  mkdir,
  readFileType,
  readFileTypeFromBuffer,
  showOpenDialog,
  getHomePath,
  openExternal,
  parseCSON,
  stringifyCSON,
}
