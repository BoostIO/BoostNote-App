import {
  FOLDER_ID_PREFIX,
  NOTE_ID_PREFIX
} from '../../../lib/consts'
import { FolderProps, Folder, NoteProps, Note } from './dataTypes'
import {
  getFolderId,
  getNoteId,
  normalizeFolderPath,
  getParentFolderPath
} from './helpers'

export enum ClientErrorTypes {
  FolderDoesNotExist = 'FolderDoesNotExist',
  ParentFolderDoesNotExist = 'ParentFolderDoesNotExist',
  InvalidFolderPath = 'InvalidFolderPath'
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

  async createRootFolderIfNotExist () {
    const rootFolderId = getFolderId('/')
    try {
      return await this.db.get<FolderProps>(rootFolderId)
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
    const allNotes = await this.db.allDocs<NoteProps>({
      include_docs: true,
      startkey: NOTE_ID_PREFIX,
      endkey: `${NOTE_ID_PREFIX}\ufff0`
    })
    const folderSet = allNotes.rows.reduce((set, row) => {
      const note = row.doc as Note
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
    const folder = await this.getFolder(parentPath)

    if (folder == null) throw new Error('The parent folder does not exist.')
  }

  async createFolder (path: string): Promise<Folder> {
    path = normalizeFolderPath(path)
    const folder: FolderProps = {
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
      ...folder
    }
  }

  async updateFolder (path: string, folder?: Partial<FolderProps>): Promise<Folder> {
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

    return this.getFolder(path) as Promise<Folder>
  }

  async getFolder (path: string): Promise<Folder> {
    return this.db.get<FolderProps>(getFolderId(path))
  }

  async removeFolder (path: string): Promise<void> {
    const folder = await this.db.get<FolderProps>(getFolderId(path))
    if (folder != null) await this.db.remove(folder)
    await this.removeNotesInFolder(path)
    await this.removeSubFolders(path)
  }

  async destroyDB (): Promise< void > {
    return this.db.destroy()
  }

  async putNote (id: string, note?: Partial<NoteProps>): Promise <Note> {
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
    const newNote = await this.getNote(id) as Note

    return newNote
  }

  async getNote (id: string): Promise<Note> {
    const note: Note = await this.db.get<NoteProps>(getNoteId(id))

    return note
  }

  async removeNotesInFolder (path: string): Promise<void > {
    const { rows } = await this.db.allDocs<NoteProps>({
      include_docs: true,
      startkey: NOTE_ID_PREFIX,
      endkey: `${NOTE_ID_PREFIX}\ufff0`
    })

    const rowsToDelete = rows.filter(row => (row.doc as Note).folder === path)

    await Promise.all(rowsToDelete.map(row => this.db.remove((row.doc as Note))))
  }

  async removeSubFolders (path: string): Promise<void > {
    const { rows } = await this.db.allDocs<NoteProps>({
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

  isFolder (doc: PouchDB.Core.IdMeta): doc is Folder {
    return doc._id.startsWith(FOLDER_ID_PREFIX)
  }

  isNote (doc: PouchDB.Core.IdMeta): doc is Note {
    return doc._id.startsWith(NOTE_ID_PREFIX)
  }

  async getAllData (): Promise <{
    folders: Folder[],
    notes: Note[]
  }> {
    const { rows } = await this.db.allDocs<NoteProps | FolderProps>({
      include_docs: true
    })

    const folders: Folder[] = []
    const notes: Note[] = []
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
