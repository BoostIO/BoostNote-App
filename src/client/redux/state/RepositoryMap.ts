import {
  TrackableMap,
  TrackableRecord,
} from 'typed-redux-kit'

export interface NoteBase {
  content: string
  createdAt: Date
  updatedAt: Date
}

export type Note = TrackableRecord<NoteBase>
export const Note = TrackableRecord<NoteBase>({
  content: '',
  createdAt: undefined,
  updatedAt: undefined,
})
export type NoteMap = TrackableMap<string, Note>

export interface FolderBase {

}

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
export const RepositoryMap: RepositoryMap = new TrackableMap()
