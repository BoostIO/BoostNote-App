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

export interface FolderBase {

}

export type Folder = TrackableRecord<FolderBase>
export const Folder = TrackableRecord<FolderBase>({})

export interface RepositoryBase {
  noteMap: TrackableMap<string, Note>
  folderMap: TrackableMap<string, Folder>
}

export type Repository = TrackableRecord<FolderBase>
export const Repository = TrackableRecord<FolderBase>({})

export type RepositoryMap = TrackableMap<string, Repository>
export const RepositoryMap: RepositoryMap = new TrackableMap()
