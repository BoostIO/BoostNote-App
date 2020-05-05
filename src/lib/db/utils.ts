import { NOTE_ID_PREFIX, FOLDER_ID_PREFIX, TAG_ID_PREFIX } from './consts'
import { join } from 'path'
import { ObjectMap, NoteDoc, FolderDoc, TagDoc, NoteStorageData } from './types'
import { generateId } from '../string'

export function values<T>(objectMap: ObjectMap<T>): T[] {
  return Object.values(objectMap) as T[]
}

export function entries<T>(objectMap: ObjectMap<T>): [string, T][] {
  return Object.entries(objectMap) as [string, T][]
}

export function getNow(): string {
  return new Date().toISOString()
}

export function generateNoteId(): string {
  return `${NOTE_ID_PREFIX}${generateId()}`
}

export function getFolderId(pathname: string): string {
  return `${FOLDER_ID_PREFIX}${pathname}`
}

export function getFolderPathname(id: string): string {
  return id.substring(FOLDER_ID_PREFIX.length)
}

export function getParentFolderPathname(pathname: string): string {
  return join(pathname, '..')
}

export function getFolderNameFromPathname(pathname: string): string | null {
  if (pathname === '/') return null
  return pathname.split('/').slice(-1)[0]
}

export function getTagId(name: string): string {
  return `${TAG_ID_PREFIX}${name}`
}

export function getTagName(id: string): string {
  return id.substring(TAG_ID_PREFIX.length)
}

export function isFolderNameValid(name: string): boolean {
  if (name.length === 0) return false
  return !/[<>:"\/\\|?*\x00-\x1F]/g.test(name)
}

export function isFolderPathnameValid(pathname: string): boolean {
  if (pathname === '/') return true
  if (!pathname.startsWith('/')) return false
  const [, ...folderNames] = pathname.split('/')
  return folderNames.every(isFolderNameValid)
}

export function isTagNameValid(name: string): boolean {
  if (name.length === 0) return false
  return !/[\s#<>:"\/\\|?*\x00-\x1F]/g.test(name)
}

enum DbClientErrorCode {
  UnprocessableEntity = 'UnprocessableEntity',
  Conflict = 'Conflict',
  NotFound = 'NotFound',
}

export class DbClientError extends Error {
  readonly name: string = 'DbClientError'
  code: DbClientErrorCode
  statusCode: number
  constructor(message: string, code: DbClientErrorCode) {
    super(message)
    this.code = code
    this.statusCode = getStatusCodeFromCode(code)
  }
}

export function getStatusCodeFromCode(code: string) {
  switch (code) {
    case DbClientErrorCode.NotFound:
      return 404
    case DbClientErrorCode.Conflict:
      return 409
    case DbClientErrorCode.UnprocessableEntity:
      return 422
  }

  return 500
}

export function createUnprocessableEntityError(message: string) {
  return new DbClientError(message, DbClientErrorCode.UnprocessableEntity)
}

export function createNotFoundError(message: string) {
  return new DbClientError(message, DbClientErrorCode.NotFound)
}

export function createConflictError(message: string) {
  return new DbClientError(message, DbClientErrorCode.Conflict)
}

export function isNoteDoc(
  doc: PouchDB.Core.ExistingDocument<any>
): doc is NoteDoc {
  return doc._id.startsWith(NOTE_ID_PREFIX)
}

export function isFolderDoc(
  doc: PouchDB.Core.ExistingDocument<any>
): doc is FolderDoc {
  return doc._id.startsWith(FOLDER_ID_PREFIX)
}

export function isTagDoc(
  doc: PouchDB.Core.ExistingDocument<any>
): doc is TagDoc {
  return doc._id.startsWith(TAG_ID_PREFIX)
}

export function getAllParentFolderPathnames(pathname: string) {
  const pathnames = []
  let currentPathname = pathname
  do {
    currentPathname = getParentFolderPathname(currentPathname)
    if (currentPathname !== '/') {
      pathnames.push(currentPathname)
    }
  } while (currentPathname !== '/')
  return pathnames
}

export function isCloudStorageData(
  data: NoteStorageData
): data is Required<NoteStorageData> {
  return data.cloudStorage != null
}
