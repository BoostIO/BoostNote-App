export interface Folder {
  path: string
  name: string
  color: string
}

export type FolderDocument = Folder & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta

export interface Note {
  title: string
  content: string
  folder: string
}

export type NoteDocument = Note & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta
