import {
  FolderDoc,
  AllDocsMap,
  TagDoc,
  TagDocEditibleProps,
  NoteDoc,
  NoteDocEditibleProps,
  Attachment,
  ObjectMap,
  PopulatedFolderDoc,
} from './types'

export default interface NoteDb {
  type: string
  init(): Promise<void>
  getFolder(pathname: string): Promise<FolderDoc | null>
  upsertFolder(pathname: string, props?: Partial<FolderDoc>): Promise<FolderDoc>
  getAllDocsMap(): Promise<AllDocsMap>
  getTag(tagName: string): Promise<TagDoc | null>
  upsertTag(
    tagName: string,
    props?: Partial<TagDocEditibleProps>
  ): Promise<TagDoc>
  getNote(noteId: string): Promise<NoteDoc | null>
  createNote(noteProps: Partial<NoteDocEditibleProps>): Promise<NoteDoc>
  updateNote(
    noteId: string,
    noteProps: Partial<NoteDocEditibleProps>
  ): Promise<NoteDoc>
  trashNote(noteId: string): Promise<NoteDoc>
  untrashNote(noteId: string): Promise<NoteDoc>
  bookmarkNote(noteId: string): Promise<NoteDoc>
  unbookmarkNote(noteId: string): Promise<NoteDoc>
  purgeNote(noteId: string): Promise<void>
  removeTag(tagName: string): Promise<void>
  removeFolder(folerPathname: string): Promise<void>
  renameFolder(
    pathname: string,
    newPathname: string
  ): Promise<{
    folders: PopulatedFolderDoc[]
    notes: NoteDoc[]
    removedFolders: string[]
  }>
  getAllFolders(): Promise<FolderDoc[]>
  upsertAttachments(files: File[]): Promise<Attachment[]>
  removeAttachment(fileName: string): Promise<void>
  getAttachmentMap(): Promise<ObjectMap<Attachment>>
}
