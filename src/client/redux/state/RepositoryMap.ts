import {
  TrackableMap,
  TrackableRecord,
} from 'typed-redux-kit'
import Types from 'client/types'

export interface NoteBase extends Types.Note {}

export type Note = TrackableRecord<NoteBase>
export const Note = TrackableRecord<NoteBase>({
  content: undefined,
  folder: undefined,
  createdAt: undefined,
  updatedAt: undefined,
})
export type NoteMap = TrackableMap<string, Note>

export interface FolderBase extends Types.Folder {}

export type Folder = TrackableRecord<FolderBase>
export const Folder = TrackableRecord<FolderBase>({})
export type FolderMap = TrackableMap<string, Folder>

export interface RepositoryBase {
  noteMap: NoteMap
  folderMap: FolderMap
}

export type Repository = TrackableRecord<RepositoryBase>
export const Repository = TrackableRecord<RepositoryBase>({
  noteMap: new TrackableMap(),
  folderMap: new TrackableMap(),
})

export type RepositoryMap = TrackableMap<string, Repository>
