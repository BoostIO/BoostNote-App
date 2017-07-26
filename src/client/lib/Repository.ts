import * as PouchDB from 'pouchdb-browser'
import { randomBytes } from 'crypto'

function generateRandomId (size = 6) {
  return randomBytes(size).toString('base64')
}

const serializedRepositoryMapKey = 'SERIALIZED_REPOSITORY_MAP'

type SerializedRepositoryMap = {
  [name: string]: RepositoryParams
}

const defaultSerializedRepositoryMap: SerializedRepositoryMap = {
  'My Notes': {
  }
}

type RepositoryParams = {
}

type NoteParams = {
  content: string
  createdAt: Date
  updatedAt: Date
}

export class Repository {
  private static repositoryMap = new Map<string, Repository>()

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
    const serializedRepositoryMap: SerializedRepositoryMap = JSON.parse(localStorage.getItem(serializedRepositoryMapKey))
    const promises = Repository.convertMapToEntries(serializedRepositoryMap)
      .map(([name, params]) =>
        Repository
          .create(name, params)
          .then(repository => Repository.repositoryMap.set(name, repository))
      )
    await Promise.all(promises)
  }

  public static convertMapToEntries (serializedMap: SerializedRepositoryMap): Array<[string, RepositoryParams]> {
    if (!serializedMap) {
      return Object.entries(defaultSerializedRepositoryMap)
    }
    return Object.entries(serializedMap)
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
    this.db = new PouchDB(name)
  }

  private db: PouchDB.Database

  private serialize () {
    return {
    }
  }

  public async getNotes () {
    return this.db.allDocs()
  }

  public async createNote (noteParams: NoteParams) {
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
      content: '',
      updatedAt: new Date(),
      deletedAt: new Date()
    })
  }

  public async updateNote (noteId: string, noteParams: NoteParams) {
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
