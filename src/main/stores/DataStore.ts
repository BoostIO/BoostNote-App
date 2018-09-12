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

  @action addStorage (name: string, storage: Storage) {
    this.storageMap.set(name, storage)
  }
}
