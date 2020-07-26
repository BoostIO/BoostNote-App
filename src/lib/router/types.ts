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

export interface StorageSettings extends BaseRouteParams {
  name: 'storages.settings'
  storageId: string
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

export interface UnknownRouteparams extends BaseRouteParams {
  name: 'unknown'
}

export type AllRouteParams =
  | StorageCreate
  | StorageSettings
  | StorageNotesRouteParams
  | StorageTrashCanRouteParams
  | StorageTagsRouteParams
  | StorageAttachmentsRouteParams
  | UnknownRouteparams
