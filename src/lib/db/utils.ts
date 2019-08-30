import uuidV1 from 'uuid/v1'
import { NOTE_ID_PREFIX, FOLDER_ID_PREFIX, TAG_ID_PREFIX } from './consts'

export function generateUuid(): string {
  return uuidV1()
}

export function generateNoteId(): string {
  return `${NOTE_ID_PREFIX}${generateUuid()}`
}

export function getFolderId(pathname: string): string {
  return `${FOLDER_ID_PREFIX}${pathname}`
}

export function getFolderPathname(id: string): string {
  return id.substring(FOLDER_ID_PREFIX.length)
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
  NotFound = 'NotFound'
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
