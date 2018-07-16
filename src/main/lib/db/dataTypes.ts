export interface Folder {
  color?: string
  createdAt: Date
  updatedAt: Date
}

export type FolderDocument = Folder & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta

export interface Note {
  title: string
  content: string
  folder: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type NoteDocument = Note & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta
