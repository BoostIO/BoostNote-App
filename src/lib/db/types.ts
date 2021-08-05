import { JsonObject } from 'type-fest'
import FSNoteDb from './FSNoteDb'

export type ObjectMap<T> = {
  [key: string]: T | undefined
}

export interface FSNoteStorageData {
  type: 'fs'
  id: string
  name: string
  location: string
}

export type NoteStorageData = FSNoteStorageData

export type NoteDocEditibleProps = {
  title: string
  content: string
  folderPathname: string
  tags: string[]
  data: JsonObject
}

export type NoteDocImportableProps = {
  createdAt: string
  updatedAt: string
} & NoteDocEditibleProps

export type NoteDoc = {
  _id: string
  createdAt: string
  updatedAt: string
  archivedAt?: string
  trashed: boolean
  _rev: string
} & NoteDocEditibleProps

export type FolderDoc = {
  _id: string // folder:${FOLDER_PATHNAME}
  createdAt: string
  updatedAt: string
  _rev?: string
} & FolderDocEditibleProps

export type FolderDocEditibleProps = {
  data: JsonObject
}

export type TagDoc = {
  _id: string // tag:${TAG_NAME}
  createdAt: string
  updatedAt: string
  _rev?: string
} & TagDocEditibleProps

export type TagDocEditibleProps = {
  createdAt: string
  updatedAt: string
  data: JsonObject
}

export type AttachmentData =
  | { type: 'blob'; blob: Blob }
  | { type: 'src'; src: string }

export type Attachment = {
  name: string
  type: string
  getData: () => Promise<AttachmentData>
}

export interface AllDocsMap {
  noteMap: ObjectMap<NoteDoc>
  folderMap: ObjectMap<FolderDoc>
  tagMap: ObjectMap<TagDoc>
}

export type NoteIdSet = Set<string>

export type FSNoteStorage = FSNoteStorageData &
  AllPopulatedDocsMap & {
    db: FSNoteDb
  }
export type NoteStorage = FSNoteStorage
export type PopulatedFolderDoc = FolderDoc & {
  pathname: string
  noteIdSet: NoteIdSet
}

export type PopulatedTagDoc = TagDoc & {
  name: string
  noteIdSet: NoteIdSet
}

export interface AllPopulatedDocsMap {
  noteMap: ObjectMap<NoteDoc>
  folderMap: ObjectMap<PopulatedFolderDoc>
  tagMap: ObjectMap<PopulatedTagDoc>
  attachmentMap: ObjectMap<Attachment>
  bookmarkedItemIds: string[]
}
