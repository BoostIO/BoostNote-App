export interface FolderProps {
  path: string
  color?: string
  createdAt: Date
  updatedAt: Date
}

export interface SerializedFolderProps {
  path: string
  color?: string
  createdAt: string
  updatedAt: string
}

export type PouchDBMeta = PouchDB.Core.GetMeta & PouchDB.Core.IdMeta

export type SerializedFolder = SerializedFolderProps & PouchDBMeta

export type Folder = FolderProps & PouchDBMeta

export interface NoteProps {
  title: string
  content: string
  folder: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type Note = NoteProps & PouchDBMeta
