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

export function getTagId(name: string): string {
  return `${TAG_ID_PREFIX}${name}`
}
