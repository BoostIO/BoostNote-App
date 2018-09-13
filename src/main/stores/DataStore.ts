import { observable, action } from 'mobx'
import ClientManager from '../lib/db/ClientManager'
import Storage from './Storage'
import { NoteDocument, FolderDocument } from '../lib/db/dataTypes'

export interface DataStoreOptions {
  manager?: ClientManager
}

export default class DataStore {
  manager: ClientManager
  @observable storageMap: Map<string, Storage>
  errors: Error[]

  constructor (options: DataStoreOptions = {}) {
    this.manager = options.manager == null
      ? new ClientManager()
      : options.manager
    this.storageMap = new Map()
    this.errors = []
  }

  async init () {
    const clientNames = this.manager.getAllClientNames()
    await Promise.all(
      clientNames.map(async name => {
        const storage = await this.initStorage(name)
        this.addStorage(name, storage)
      })
    )
  }

  async initStorage (name: string): Promise<Storage> {
    const client = this.manager.getClient(name)

    const {
      folders,
      notes
    } = await client.getAllData()

    const storage = new Storage()
    storage.addNote(...notes)
    storage.addFolder(...folders)

    return storage
  }

  async putNote (name: string, id: string, note: Partial<NoteDocument>): Promise<NoteDocument> {
    const client = this.manager.getClient(name)
    const updatedNote = await client.putNote(id, note)

    this.assertStorageExists(name)
    const storage = this.storageMap.get(name) as Storage
    storage.addNote(updatedNote)

    return updatedNote
  }

  async putFolder (name: string, id: string, folder: Partial<FolderDocument>): Promise<FolderDocument> {
    const client = this.manager.getClient(name)
    const updatedFolder = await client.putFolder(id, folder)

    this.assertStorageExists(name)
    const storage = this.storageMap.get(name) as Storage
    storage.addFolder(updatedFolder)

    return updatedFolder
  }

  assertStorageExists (name: string) {
    if (!this.storageMap.has(name)) throw new Error('The storage does not exist in DataStore')
  }

  @action addStorage (name: string, storage: Storage) {
    this.storageMap.set(name, storage)
  }
}
