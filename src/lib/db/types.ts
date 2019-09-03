import Client from './Client'
import { JsonObject, Except } from 'type-fest'

export type ExceptRev<D extends PouchDB.Core.RevisionIdMeta> = Except<D, '_rev'>

export type NoteIdSet = Set<string>

export interface NoteStorageData {
  id: string
  name: string
}

export type NoteStorage = NoteStorageData &
  NoteStorageDocMap & {
    client: Client
  }

export type NoteDataEditibleProps = {
  title: string
  content: string
  folderPathname: string
  tags: string[]
  data: JsonObject
}

export type NoteData = {
  _id: string
  createdAt: string
  updatedAt: string
  trashed: boolean
  _rev: string
} & NoteDataEditibleProps

export type FolderData = {
  _id: string // folder:${FOLDER_PATHNAME}
  createdAt: string
  updatedAt: string
  _rev: string
} & FolderDataEditibleProps

export type FolderDataEditibleProps = {
  data: JsonObject
}

export type TagData = {
  _id: string // tag:${TAG_NAME}
  createdAt: string
  updatedAt: string
  data: JsonObject
  _rev: string
} & TagDataEditibleProps

export type TagDataEditibleProps = {
  data: JsonObject
}

export interface NoteStorageDocMap {
  noteMap: Map<string, NoteData>
  folderMap: Map<
    string,
    FolderData & {
      pathname: string
      noteIdSet: NoteIdSet
    }
  >
  tagMap: Map<
    string,
    TagData & {
      name: string
      noteIdSet: NoteIdSet
    }
  >
}
