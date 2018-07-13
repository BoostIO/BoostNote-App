import PouchDBCore from 'pouchdb-core'
import PouchDBIDBAdapter from 'pouchdb-adapter-idb'
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory'
import PouchDBHttpAdapter from 'pouchdb-adapter-http'
import PouchDBReplication from 'pouchdb-replication'
import { Folder, FolderDocument, Note, NoteDocument } from './dataTypes'

const PouchDB = PouchDBCore
  .plugin(PouchDBIDBAdapter)
  .plugin(PouchDBMemoryAdapter)
  .plugin(PouchDBHttpAdapter)
  .plugin(PouchDBReplication)

interface ClientOptions {
  adapter: 'memory' | 'indexeddb'
}

export default class Client {
  private db: PouchDB.Database

  constructor (dbName: string, options?: ClientOptions) {
    const pouchDBOptions: PouchDB.Configuration.DatabaseConfiguration = {}
    if (options != null) {
      if (options.adapter != null) {
        pouchDBOptions.adapter = options.adapter
      }
    }

    this.db = new PouchDB(dbName, pouchDBOptions)
  }

  async putFolder (path: string, folder?: Partial<Folder>) {
    const prevFolder = await this.getFolder(path)

    await this.db.put({
      ...prevFolder,
      _id: getFolderId(path),
      ...folder
    })

    return this.db.get<Folder>(`folder:${path}`)
  }

  async getFolder (path: string) {
    let folder: FolderDocument
    try {
      folder = await this.db.get<Folder>(getFolderId(path))
    } catch (error) {
      switch (error.status) {
        case 404:
          return null
          break
        default:
          throw error
      }
    }
    return folder
  }

  async removeFolder (path: string) {
    const folder = await this.getFolder(path)
    if (folder != null) await this.db.remove(folder)
  }

  async destroyDB () {
    return this.db.destroy()
  }
}

function getFolderId (path: string) {
  return `folder:${path}`
}

function getNoteId (id: string) {
  return `note:${id}`
}
