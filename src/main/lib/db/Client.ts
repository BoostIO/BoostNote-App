import {
  FOLDER_ID_PREFIX,
  NOTE_ID_PREFIX
} from '../../../lib/consts'
import * as Types from './dataTypes'
import {
  getFolderId,
  getNoteId,
  normalizeFolderPath,
  getParentFolderPath
} from './helpers'

export enum ClientErrorTypes {
  FolderDoesNotExistError = 'FolderDoesNotExistError',
  ParentFolderDoesNotExistError = 'ParentFolderDoesNotExistError',
  InvalidFolderPathError = 'InvalidFolderPathError'
}

export class FolderDoesNotExistError extends Error {
  readonly name: string = ClientErrorTypes.FolderDoesNotExistError
}

export class InvalidFolderPathError extends Error {
  readonly name: string = ClientErrorTypes.InvalidFolderPathError
}

export class ParentFolderDoesNotExistError extends Error {
  readonly name: string = ClientErrorTypes.ParentFolderDoesNotExistError
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

  validateFolderPath (input: string): boolean {
    if (input.length === 0) return false

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
    if (!this.validateFolderPath(input)) throw new InvalidFolderPathError(`\`${input}\` is not a valid folder path`)
  }

  async createRootFolderIfNotExist () {
    const rootFolderId = getFolderId('/')
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
    if (path === '/') throw new Error('The given path is root path')
    const parentPath = getParentFolderPath(path)
    try {
      await this.db.get(getFolderId(parentPath))
    } catch (error) {
      if (error.name === 'not_found') {
        throw new ParentFolderDoesNotExistError('The parent folder does not exist.')
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
      _id: getFolderId(path),
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
    path = normalizeFolderPath(path)
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
      _id: getFolderId(path),
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
      folder = await this.db.get<Types.SerializedFolderProps>(getFolderId(path))
    } catch (error) {
      switch (error.name) {
        case 'not_found':
          throw new FolderDoesNotExistError('The folder does not exist.')
        default:
          throw error
      }
    }

    return this.deserializeFolder(folder)
  }

  async removeFolder (path: string): Promise<void> {
    const folder = await this.db.get<Types.FolderProps>(getFolderId(path))
    if (folder != null) await this.db.remove(folder)
    await this.removeNotesInFolder(path)
    await this.removeSubFolders(path)
  }

  async destroyDB (): Promise< void > {
    return this.db.destroy()
  }

  async putNote (id: string, note?: Partial<Types.NoteProps>): Promise <Types.Note> {
    const currentNote = await this.getNote(id)

    if (note != null) {
      if (note.folder != null) {
        const folder = await this.getFolder(note.folder)
        if (folder == null) throw new Error('folder does not exist.')
      }
    }

    await this.db.put({
      createdAt: new Date(),
      title: '',
      content: '',
      folder: '/',
      tags: [],
      ...currentNote,
      _id: getNoteId(id),
      updatedAt: new Date(),
      ...note
    })
    const newNote = await this.getNote(id) as Types.Note

    return newNote
  }

  async getNote (id: string): Promise<Types.Note> {
    const note: Types.Note = await this.db.get<Types.NoteProps>(getNoteId(id))

    return note
  }

  async removeNotesInFolder (path: string): Promise<void > {
    const { rows } = await this.db.allDocs<Types.NoteProps>({
      include_docs: true,
      startkey: NOTE_ID_PREFIX,
      endkey: `${NOTE_ID_PREFIX}\ufff0`
    })

    const rowsToDelete = rows.filter(row => (row.doc as Types.Note).folder === path)

    await Promise.all(rowsToDelete.map(row => this.db.remove((row.doc as Types.Note))))
  }

  async removeSubFolders (path: string): Promise<void > {
    const { rows } = await this.db.allDocs<Types.NoteProps>({
      startkey: `${FOLDER_ID_PREFIX}${path}/`,
      endkey: `${FOLDER_ID_PREFIX}${path}/\ufff0`
    })

    await Promise.all(rows.map(row => {
      const [, ...pathArray] = row.id.split(FOLDER_ID_PREFIX)
      return this.removeFolder(pathArray.join(''))
    }))
  }

  async removeNote (id: string): Promise<void > {
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
