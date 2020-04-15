import { ParsedUrlQuery } from 'querystring'

export interface Location {
  pathname: string
  hash: string
  query: ParsedUrlQuery
}

export interface BaseRouteParams {
  name: string
}

export interface StorageCreate extends BaseRouteParams {
  name: 'storages.create'
}

export interface StorageEdit extends BaseRouteParams {
  name: 'storages.edit'
  storageId: string
}

export interface StorageBookmarkNotes extends BaseRouteParams {
  name: 'storages.bookmarks'
  storageId?: string
  noteId?: string
}

export interface StorageNotesRouteParams extends BaseRouteParams {
  name: 'storages.notes'
  storageId: string
  folderPathname: string
  noteId?: string
}

export interface StorageTrashCanRouteParams extends BaseRouteParams {
  name: 'storages.trashCan'
  storageId: string
  noteId?: string
}

export interface StorageTagsRouteParams extends BaseRouteParams {
  name: 'storages.tags.show'
  storageId: string
  tagName: string
  noteId?: string
}

export interface StorageAttachmentsRouteParams extends BaseRouteParams {
  name: 'storages.attachments'
  storageId: string
}

export interface TutorialsRouteParams extends BaseRouteParams {
  name: 'tutorials.show'
  path: string
}

export interface UnknownRouteparams extends BaseRouteParams {
  name: 'unknown'
}

export type AllRouteParams =
  | StorageCreate
  | StorageEdit
  | StorageBookmarkNotes
  | StorageNotesRouteParams
  | StorageTrashCanRouteParams
  | StorageTagsRouteParams
  | StorageAttachmentsRouteParams
  | UnknownRouteparams
  | TutorialsRouteParams
