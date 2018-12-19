export interface EditableFolderProps {
  color?: string
}

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

export interface EditableNoteProps {
  title: string
  content: string
  tags: string[]
}

export interface SerializedNoteProps {
  title: string
  content: string
  folder: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface NoteProps {
  title: string
  content: string
  folder: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type SerializedNote = SerializedNoteProps & PouchDBMeta

export type Note = NoteProps & PouchDBMeta
