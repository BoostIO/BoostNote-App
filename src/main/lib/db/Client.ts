import {
  FOLDER_ID_PREFIX,
  NOTE_ID_PREFIX
} from '../../../lib/consts'
import * as Types from './dataTypes'
import uuid from 'uuid/v1'

export enum ClientErrorTypes {
  NotFoundError = 'NotFoundError',
  UnprocessableEntityError = 'UnprocessableEntityError'
}

export class NotFoundError extends Error {
  readonly name: string = ClientErrorTypes.NotFoundError
}

export class UnprocessableEntityError extends Error {
  readonly name: string = ClientErrorTypes.UnprocessableEntityError
}

export const reservedPathNameRegex = /[<>:"\\|?*\x00-\x1F]/

export default class Client {
  public initialized: boolean

  constructor (
    private db: PouchDB.Database
  ) {
  }

  getDb () {
    return this.db
  }

  prependFolderIdPrefix (path: string): string {
    return `${FOLDER_ID_PREFIX}${path}`
  }

  prependNoteIdPrefix (id: string): string {
    return `${NOTE_ID_PREFIX}${id}`
  }

  getParentFolderPath (path: string): string {
    if (path === '/') throw new UnprocessableEntityError('The given path is root path.')
    const splitted = path.split('/')
    splitted.shift()
    splitted.pop()
    return '/' + splitted.join('/')
  }

  validateFolderPath (input: string): boolean {
    if (input.length === 0) return false
    if (input === '/') return true

    const elements = input.split('/')

    // The first element must be empty string because the valid folder path starts with `/`
    const firstElement = elements.shift()
    if (firstElement == null || firstElement.length > 0) return false

    // Each element
    const hasInvalidElement = elements.some(element => {
      return element.length === 0 || reservedPathNameRegex.test(element)
    })
    if (hasInvalidElement) return false

    return true
  }

  assertFolderPath (input: string) {
    if (!this.validateFolderPath(input)) throw new UnprocessableEntityError(`\`${input}\` is not a valid folder path.`)
  }

  async createRootFolderIfNotExist () {
    const rootFolderId = this.prependFolderIdPrefix('/')
    try {
      return await this.db.get<Types.SerializedFolderProps>(rootFolderId)
    } catch (error) {
      if (error.status === 404) {
        return this.db.put({
          _id: rootFolderId,
          path: '/'
        })
      }
      throw error
    }
  }

  async init () {
    await this.createRootFolderIfNotExist()
    const allNotes = await this.db.allDocs<Types.NoteProps>({
      include_docs: true,
      startkey: NOTE_ID_PREFIX,
      endkey: `${NOTE_ID_PREFIX}\ufff0`
    })
    const folderSet = allNotes.rows.reduce((set, row) => {
      const note = row.doc as Types.Note
      if (!set.has(note.folder)) set.add(note.folder)
      return set
    }, new Set())

    await Promise.all([...folderSet].map(async folderPath => {
      return this.updateFolder(folderPath)
    }))
  }

  async assertIfParentFolderExists (path: string) {
    if (path === '/') throw new UnprocessableEntityError('The given path is a root path.')
    const parentPath = this.getParentFolderPath(path)
    try {
      await this.db.get(this.prependFolderIdPrefix(parentPath))
    } catch (error) {
      if (error.name === 'not_found') {
        throw new NotFoundError('The parent folder does not exist.')
      } else {
        throw error
      }
    }
  }

  async createFolder (path: string, folderProps?: Partial<Types.FolderProps>): Promise<Types.Folder> {
    await this.assertFolderPath(path)
    await this.assertIfParentFolderExists(path)

    const folder: Types.FolderProps = {
      ...folderProps,
      path,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const doc = await this.db.put({
      createdAt: new Date(),
      _id: this.prependFolderIdPrefix(path),
      updatedAt: new Date(),
      ...folder
    })

    return {
      _id: doc.id,
      _rev: doc.rev,
      ...folder
    }
  }

  async updateFolder (path: string, folder?: Partial<Types.FolderProps>): Promise<Types.Folder> {
    await this.assertFolderPath(path)
    const prevFolder = await this.getFolder(path)
    if (path !== '/') {
      await this.assertIfParentFolderExists(path)
    }
    if (prevFolder != null && folder == null) {
      return prevFolder
    }

    await this.db.put({
      createdAt: new Date(),
      ...prevFolder,
      _id: this.prependFolderIdPrefix(path),
      updatedAt: new Date(),
      ...folder
    })

    return this.getFolder(path) as Promise<Types.Folder>
  }

  deserializeFolder (folder: Types.SerializedFolder): Types.Folder {
    return {
      ...folder,
      createdAt: new Date(folder.createdAt),
      updatedAt: new Date(folder.updatedAt)
    }
  }

  async getFolder (path: string): Promise<Types.Folder> {
    let folder: Types.SerializedFolder
    try {
      folder = await this.db.get<Types.SerializedFolderProps>(this.prependFolderIdPrefix(path))
    } catch (error) {
      switch (error.name) {
        case 'not_found':
          throw new NotFoundError('The folder does not exist.')
        default:
          throw error
      }
    }

    return this.deserializeFolder(folder)
  }

  async hasFolder (path: string): Promise<boolean> {
    try {
      await this.db.get<Types.SerializedFolderProps>(this.prependFolderIdPrefix(path))
      return true
    } catch (error) {
      switch (error.name) {
        case 'not_found':
          return false
        default:
          throw error
      }
    }
  }

  async assertIfClientHasFolder (path: string): Promise<void> {
    const clientHasFolder = await this.hasFolder(path)
    if (!clientHasFolder) throw new NotFoundError('The folder does not exist.')
  }

  /**
   * TODO:
   * - move notes
   * - move sub folders
   */
  async moveFolder (path: string, nextPath: string) {
    await this.assertFolderPath(path)
    await this.assertFolderPath(nextPath)

    await this.createFolder(nextPath)
    await this.removeFolder(path)
  }

  async removeFolder (path: string): Promise<void> {
    const folder = await this.db.get<Types.FolderProps>(this.prependFolderIdPrefix(path))
    if (folder != null) await this.db.remove(folder)
    await this.removeNotesInFolder(path)
    await this.removeSubFolders(path)
  }

  async destroyDB (): Promise< void > {
    return this.db.destroy()
  }

  async createNote (path: string, note: Types.EditableNoteProps): Promise<Types.Note> {
    this.assertFolderPath(path)
    await this.assertIfClientHasFolder(path)

    const id = this.prependNoteIdPrefix(uuid())
    const props = {
      title: '',
      folder: path,
      tags: [],
      content: note.content,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const doc = await this.db.put<Types.NoteProps>({
      _id: id,
      ...props
    })

    return {
      _id: id,
      _rev: doc.rev,
      ...props
    }
  }

  async updateNote (noteId: string, note: Partial<Types.EditableNoteProps>): Promise<Types.Note> {
    let serializedNote: Types.SerializedNote
    try {
      serializedNote = await this.db.get<Types.SerializedNoteProps>(noteId)
    } catch (error) {
      switch (error.name) {
        case 'not_found':
          throw new NotFoundError('The note does not exist.')
        default:
          throw error
      }
    }

    const deserializedNote = this.deserializeNote(serializedNote)
    const props = {
      ...deserializedNote,
      ...note,
      updatedAt: new Date()
    }
    const doc = await this.db.put({
      ...props
    })

    return {
      _id: noteId,
      _rev: doc.rev,
      ...props
    }
  }

  deserializeNote (note: Types.SerializedNote): Types.Note {
    return {
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt)
    }
  }

  async getNote (id: string): Promise<Types.Note> {
    let serializedNote: Types.SerializedNote
    let note: Types.Note
    try {
      serializedNote = await this.db.get<Types.SerializedNoteProps>(id)
      note = this.deserializeNote(serializedNote)
    } catch (error) {
      switch (error.name) {
        case 'not_found':
          throw new NotFoundError('The note does not exist.')
        default:
          throw error
      }
    }

    return note
  }

  async moveNote (noteId: string, nextPath: string): Promise<Types.Note> {
    this.validateFolderPath(nextPath)
    await this.hasFolder(nextPath)
    let serializedNote: Types.SerializedNote
    try {
      serializedNote = await this.db.get<Types.SerializedNoteProps>(noteId)
    } catch (error) {
      switch (error.name) {
        case 'not_found':
          throw new NotFoundError('The note does not exist.')
        default:
          throw error
      }
    }

    const deserializedNote = this.deserializeNote(serializedNote)
    const props = {
      ...deserializedNote,
      folder: nextPath,
      updatedAt: new Date()
    }
    const doc = await this.db.put({
      ...props
    })

    return {
      _id: noteId,
      _rev: doc.rev,
      ...props
    }
  }

  // TODO: Map notes by a folder
  async removeNotesInFolder (path: string): Promise<void> {
    const { rows } = await this.db.allDocs<Types.NoteProps>({
      include_docs: true,
      startkey: NOTE_ID_PREFIX,
      endkey: `${NOTE_ID_PREFIX}\ufff0`
    })

    const rowsToDelete = rows.filter(row => (row.doc as Types.Note).folder === path)

    await Promise.all(rowsToDelete.map(row => this.db.remove((row.doc as Types.Note))))
  }

  async removeSubFolders (path: string): Promise<void> {
    const { rows } = await this.db.allDocs<Types.NoteProps>({
      startkey: `${FOLDER_ID_PREFIX}${path}/`,
      endkey: `${FOLDER_ID_PREFIX}${path}/\ufff0`
    })

    await Promise.all(rows.map(row => {
      const [, ...pathArray] = row.id.split(FOLDER_ID_PREFIX)
      return this.removeFolder(pathArray.join(''))
    }))
  }

  async removeNote (id: string): Promise<void> {
    const note = await this.getNote(id)
    if (note != null) await this.db.remove(note)
  }

  isFolder (doc: PouchDB.Core.IdMeta): doc is Types.Folder {
    return doc._id.startsWith(FOLDER_ID_PREFIX)
  }

  isNote (doc: PouchDB.Core.IdMeta): doc is Types.Note {
    return doc._id.startsWith(NOTE_ID_PREFIX)
  }

  async getAllData (): Promise <{
    folders: Types.Folder[],
    notes: Types.Note[]
  }> {
    const { rows } = await this.db.allDocs<Types.NoteProps | Types.FolderProps>({
      include_docs: true
    })

    const folders: Types.Folder[] = []
    const notes: Types.Note[] = []
    rows.forEach(row => {
      const doc = row.doc as PouchDB.Core.IdMeta
      if (this.isFolder(doc)) {
        folders.push(doc)
        return
      }
      if (this.isNote(doc)) {
        notes.push(doc)
        return
      }
    })

    return {
      folders,
      notes
    }
  }
}
