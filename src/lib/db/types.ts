import NoteDb from './NoteDb'
import { JsonObject, Except } from 'type-fest'

export type ExceptRev<D extends PouchDB.Core.RevisionIdMeta> = Except<D, '_rev'>

export type NoteIdSet = Set<string>

export interface NoteStorageData {
  id: string
  name: string
}

export type NoteStorage = NoteStorageData &
  AllDocsMap & {
    db: NoteDb
  }

export type NoteDocEditibleProps = {
  title: string
  content: string
  folderPathname: string
  tags: string[]
  data: JsonObject
}

export type NoteDoc = {
  _id: string
  createdAt: string
  updatedAt: string
  trashed: boolean
  _rev: string
} & NoteDocEditibleProps

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
  data: JsonObject
  _rev: string
} & TagDocEditibleProps

export type TagDocEditibleProps = {
  data: JsonObject
}

export interface AllDocsMap {
  noteMap: Map<string, NoteDoc>
  folderMap: Map<string, FolderDoc>
  tagMap: Map<string, TagDoc>
}
