export interface FolderMeta {
  _id: string
}

export interface FolderProps {
  path: string
  color?: string
  createdAt: Date
  updatedAt: Date
}

export type Folder = FolderProps & FolderMeta

export interface NoteMeta {
  _id: string
  _rev: string
}

export interface NoteProps {
  title: string
  content: string
  folder: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type Note = NoteProps & NoteMeta
