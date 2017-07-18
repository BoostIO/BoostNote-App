import * as PouchDB from 'pouchdb-browser'
import { randomBytes } from 'crypto'

function generateRandomId (size = 6) {
  return randomBytes(size).toString('base64')
}

const serializedRepositoryMapKey = 'SERIALIZED_REPOSITORY_MAP'

type SerializedRepositoryMap = {
  [slug: string]: RepositoryParams
}

const defaultSerializedRepositoryMap: SerializedRepositoryMap = {
  'my-notes': {
    name: 'My Notes'
  }
}

type RepositoryParams = {
  name: string
}

type NoteParams = {
  content: string
  createdAt: Date
  updatedAt: Date
}

export class Repository {
  private static repositoryMap = new Map<string, Repository>()

  public static async create (slug: string, params: RepositoryParams) {
    const repository = new this(slug, params)
    this.repositoryMap.set(slug, repository)
    await this.saveRepositoryMap()
    return repository
  }

  public static async remove (slug: string) {
    if (!this.repositoryMap.has(slug)) throw new Error('Repository doesnt exist')
    this.repositoryMap.delete(slug)
    await this.saveRepositoryMap()
  }

  public static async loadRepositoryMap () {
    this.repositoryMap.clear()
    const serializedRepositoryMap: SerializedRepositoryMap = JSON.parse(localStorage.getItem(serializedRepositoryMapKey))
    const promises = Object.entries(serializedRepositoryMap)
      .filter(([slug, params]) => {
        if (typeof params.name !== 'string') return false
        return true
      })
      .map(([slug, params]) =>
        this
          .create(slug, params)
          .then(repository => this.repositoryMap.set(slug, repository))
      )
    await Promise.all(promises)
  }

  public static async saveRepositoryMap () {
    const entries = Array.from(this.repositoryMap.entries())
    const serializedMap = entries
      .reduce((acc, [slug, repository]) => {
        acc[slug] = repository.serialize()
        return acc
      }, {} as SerializedRepositoryMap)
    localStorage.setItem(serializedRepositoryMapKey, JSON.stringify(serializedMap))
  }

  constructor (slug: string, params: RepositoryParams) {
    this.name = params.name
    this.db = new PouchDB(slug)
  }

  public name: string
  private db: PouchDB.Database

  private serialize () {
    return {
      name: this.name
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
