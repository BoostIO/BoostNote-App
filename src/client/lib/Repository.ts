import * as PouchDB from 'pouchdb-browser'
import { randomBytes } from 'crypto'

const DefaultFolderName = 'Notes'

function generateRandomId (size = 6) {
  return randomBytes(size).toString('base64')
}

const serializedRepositoryMapKey = 'SERIALIZED_REPOSITORY_MAP'

type SerializedRepositoryMap = {
  [name: string]: RepositoryParams
}

const defaultSerializedRepositoryMap: SerializedRepositoryMap = {
  [DefaultFolderName]: {
  }
}

type RepositoryParams = {
}

type Note = {
  content: string
  folder: string
  createdAt: Date
  updatedAt: Date
}

type NoteMap = Map<string, Note>

type Folder = {

}

type SerializedRepositoryBundle = {
  noteMap: {
    [id: string]: Note
  }
  folderMap: {
    [path: string]: Folder
  }
}

type SerializedRepositoryMapWithNoteMap = Map<string, SerializedRepositoryBundle>

export type RepositoryMap = Map<string, Repository>

export class Repository {
  private static repositoryMap: RepositoryMap = new Map()

  public static async create (name: string, params: RepositoryParams) {
    const repository = new Repository(name, params)
    Repository.repositoryMap.set(name, repository)
    await Repository.saveRepositoryMap()
    return repository
  }

  public static async remove (name: string) {
    if (!Repository.repositoryMap.has(name)) throw new Error('Repository doesnt exist')
    Repository.repositoryMap.delete(name)
    await Repository.saveRepositoryMap()
  }

  public static async loadRepositoryMap () {
    Repository.repositoryMap.clear()
    const promises = Repository.getSerializedEntriesFromLocalStorage()
      .map(([name, params]) =>
        Repository
          .create(name, params)
          .then(repository => Repository.repositoryMap.set(name, repository))
      )
    await Promise.all(promises)
  }

  public static async initialize (): Promise<RepositoryMap> {
    await Repository.loadRepositoryMap()
    return Repository.repositoryMap
  }

  private static getSerializedEntriesFromLocalStorage (): Array<[string, RepositoryParams]> {
    const serializedRepositoryMap: SerializedRepositoryMap = JSON.parse(localStorage.getItem(serializedRepositoryMapKey))
    if (!serializedRepositoryMap) {
      return Object.entries(defaultSerializedRepositoryMap)
    }
    return Object.entries(serializedRepositoryMap)
  }

  public static async getSerializedRepositoryMapWithNoteMap (): Promise<SerializedRepositoryMapWithNoteMap> {
    const serializedEntries = await Promise.all(Array.from(Repository.repositoryMap.entries())
      .map(([name, repository]) => repository
        .serializeBundle()
        .then((serializedRepositoryBundle) => ({
          name,
          serializedRepositoryBundle
        }))
      ))

    return serializedEntries
      .reduce((partialMap, {name, serializedRepositoryBundle}) => {
        partialMap.set(name, serializedRepositoryBundle)
        return partialMap
      }, new Map())
  }

  public static async saveRepositoryMap () {
    const entries = Array.from(Repository.repositoryMap.entries())
    const serializedMap = entries
      .reduce((acc, [name, repository]) => {
        acc[name] = repository.serialize()
        return acc
      }, {} as SerializedRepositoryMap)
    localStorage.setItem(serializedRepositoryMapKey, JSON.stringify(serializedMap))
  }

  constructor (name: string, params: RepositoryParams) {
    this.db = new PouchDB<Note>(name)
  }

  private db: PouchDB.Database<Note>

  private serialize () {
    return {
    }
  }

  public async serializeBundle () {
    const noteMap = await this.getNoteMap()
    const folderMap = new Map()
    for (const [id, note] of noteMap) {
      if (!folderMap.has(note.folder)) {
        folderMap.set(note.folder, {})
      }
    }
    if (!folderMap.has(DefaultFolderName)) {
      folderMap.set(DefaultFolderName, {})
    }
    return {
      ...(await this.serialize()),
      noteMap,
      folderMap,
    }
  }

  public async getNoteMap () {
    return (await this.db.allDocs()).rows.reduce((noteMap, row) => {
      noteMap.set(row.id, {
        createdAt: row.doc.createdAt,
        updatedAt: row.doc.updatedAt,
        content: row.doc.content,
        folder: row.doc.folder,
      })
      return noteMap
    }, new Map() as NoteMap)
  }

  public async createNote (noteParams: Note) {
    let noteId
    while (true) {
      noteId = generateRandomId()
      // `get` throws error if document doesn't exist.
      try {
        await this.db.get(noteId)
      } catch (err) {
        break
      }
    }

    return this.db.put({
      _id: noteId,
      folder: noteParams.folder,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  public async updateNote (noteId: string, noteParams: Note) {
    const note = await this.db.get(noteId)

    return await this.db.put({
      _id: note._id,
      _rev: note._rev,
      ...noteParams
    })
  }

  public async  removeNote (noteId: string) {
    const note = await this.db.get(noteId)

    return await this.db.remove({
      _id: note._id,
      _rev: note._rev
    })
  }
}
