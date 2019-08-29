import Client from './Client'

export type MapObject<V> = {
  [key: string]: V
}
export type NoteIdSet = MapObject<string>

export interface NoteStorageData {
  id: string
  name: string
}

export type NoteStorage = NoteStorageData & {
  noteMap: MapObject<Note>
  folderMap: MapObject<
    Folder & {
      noteIdSet: NoteIdSet
    }
  >
  tagMap: MapObject<
    Tag & {
      noteIdSet: NoteIdSet
    }
  >
  client: Client
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  movedToTrash: boolean
}

export interface Folder {
  id: string
  path: string
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
