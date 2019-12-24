import NoteDb from './NoteDb'
import { JsonObject, Except } from 'type-fest'

export type ObjectMap<T> = {
  [key: string]: T | undefined
}

/**
 * DB Types
 */

export type ExceptRev<D extends PouchDB.Core.RevisionIdMeta> = Except<D, '_rev'>

export interface NoteStorageData {
  id: string
  name: string
  cloudStorage?: {
    id: number
    size: number
    updatedAt: number
  }
}

export type NoteDocEditibleProps = {
  title: string
  content: string
  folderPathname: string
  tags: string[]
  bookmarked: boolean
  data: JsonObject
}

export type NoteDoc = {
  _id: string
  createdAt: string
  updatedAt: string
  trashed: boolean
  _rev: string
} & NoteDocEditibleProps

export type PopulatedNoteDoc = NoteDoc & { storageId: string }

export type FolderDoc = {
  _id: string // folder:${FOLDER_PATHNAME}
  createdAt: string
  updatedAt: string
  _rev: string
} & FolderDocEditibleProps

export type FolderDocEditibleProps = {
  data: JsonObject
}

export type TagDoc = {
  _id: string // tag:${TAG_NAME}
  createdAt: string
  updatedAt: string
  _rev: string
} & TagDocEditibleProps

export type TagDocEditibleProps = {
  data: JsonObject
}

export type Attachment = {
  name: string
  type: string
  blob: Blob
}

export interface AllDocsMap {
  noteMap: ObjectMap<PopulatedNoteDoc>
  folderMap: ObjectMap<FolderDoc>
  tagMap: ObjectMap<TagDoc>
}

/**
 * React state types
 */

export type NoteIdSet = Set<string>
export type NoteStorage = NoteStorageData &
  AllPopulatedDocsMap & {
    db: NoteDb
  }

export type PopulatedFolderDoc = FolderDoc & {
  pathname: string
  noteIdSet: NoteIdSet
}

export type PopulatedTagDoc = TagDoc & {
  name: string
  noteIdSet: NoteIdSet
}

export interface AllPopulatedDocsMap {
  noteMap: ObjectMap<PopulatedNoteDoc>
  folderMap: ObjectMap<PopulatedFolderDoc>
  tagMap: ObjectMap<PopulatedTagDoc>
  attachmentMap: ObjectMap<Attachment>
}
