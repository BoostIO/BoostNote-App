import { observable, action } from 'mobx'
import ClientManager from '../lib/db/ClientManager'
import Storage from './Storage'
import * as Types from '../lib/db/dataTypes'

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
    await this.manager.init()
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

  async createFolder (name: string, path: string, folder: Types.EditableFolderProps): Promise<Types.Folder> {
    const client = this.manager.getClient(name)
    const createdFolder = await client.createFolder(path, folder)

    this.assertStorageExists(name)
    const storage = this.storageMap.get(name) as Storage
    storage.addFolder(createdFolder)

    return createdFolder
  }

  async updateFolder (name: string, path: string, folder: Partial<Types.EditableFolderProps>): Promise<Types.Folder> {
    const client = this.manager.getClient(name)
    const updatedFolder = await client.updateFolder(path, folder)

    this.assertStorageExists(name)
    const storage = this.storageMap.get(name) as Storage
    storage.addFolder(updatedFolder)

    return updatedFolder
  }

  async createNote (name: string, path: string, note: Types.EditableNoteProps): Promise<Types.Note> {
    const client = this.manager.getClient(name)
    const createdNote = await client.createNote(path, note)

    this.assertStorageExists(name)
    const storage = this.storageMap.get(name) as Storage
    storage.addNote(createdNote)

    return createdNote
  }

  async updateNote (name: string, id: string, note: Partial<Types.EditableNoteProps>): Promise<Types.Note> {
    const client = this.manager.getClient(name)
    const updatedNote = await client.updateNote(id, note)

    this.assertStorageExists(name)
    const storage = this.storageMap.get(name) as Storage
    storage.addNote(updatedNote)

    return updatedNote
  }

  assertStorageExists (name: string) {
    if (!this.storageMap.has(name)) throw new Error('The storage does not exist in DataStore')
  }

  @action addStorage (name: string, storage: Storage) {
    this.storageMap.set(name, storage)
  }
}
