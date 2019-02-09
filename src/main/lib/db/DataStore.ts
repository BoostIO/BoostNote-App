import { observable, action } from 'mobx'
import ClientManager from '../db/ClientManager'
import Storage from './Storage'
import * as Types from '../../types'
import { getMetaData } from '../markdown'

export interface DataStoreOptions {
  manager?: ClientManager
}

export class DataStore {
  manager: ClientManager
  @observable storageMap: Map<string, Storage>
  errors: Error[]

  constructor(options: DataStoreOptions = {}) {
    this.manager =
      options.manager == null ? new ClientManager() : options.manager
    this.storageMap = new Map()
    this.errors = []
  }

  async init() {
    await this.manager.init()
    const storageMetaList = this.manager.getStorageMetaList()
    await Promise.all(
      storageMetaList.map(async ({ id, name }) => {
        const storage = await this.initStorage(id, name)
        this.addStorageToMap(id, storage)
      })
    )
  }

  async initStorage(storageId: string, name: string): Promise<Storage> {
    const client = this.manager.getClient(storageId)

    const { folders, notes } = await client.getAllData()

    const storage = new Storage(name)
    storage.addNote(...notes)
    storage.addFolder(...folders)

    return storage
  }

  async createStorage(name: string) {
    const client = await this.manager.addClient(name)
    const { id } = client
    const { folders, notes } = await client.getAllData()

    const storage = new Storage(name)
    storage.addNote(...notes)
    storage.addFolder(...folders)

    this.addStorageToMap(id, storage)
  }

  async removeStorage(id: string) {
    await this.manager.removeClient(id)

    this.removeStorageFromMap(id)
  }

  async createFolder(
    id: string,
    path: string,
    folder: Types.EditableFolderProps = {}
  ): Promise<Types.Folder> {
    const client = this.manager.getClient(id)
    const createdFolder = await client.createFolder(path, folder)

    this.assertStorageExists(id)
    const storage = this.storageMap.get(id)!
    storage.addFolder(createdFolder)

    return createdFolder
  }

  async updateFolder(
    id: string,
    path: string,
    folder: Partial<Types.EditableFolderProps>
  ): Promise<Types.Folder> {
    const client = this.manager.getClient(id)
    const updatedFolder = await client.updateFolder(path, folder)

    this.assertStorageExists(id)
    const storage = this.storageMap.get(id)!
    storage.addFolder(updatedFolder)

    return updatedFolder
  }

  async removeFolder(id: string, path: string): Promise<void> {
    const client = this.manager.getClient(id)
    await client.removeFolder(path)

    this.assertStorageExists(id)
    const storage = this.storageMap.get(id)!
    storage.removeFolder(path)
  }

  async createNote(
    storageId: string,
    path: string,
    note: Partial<Types.EditableNoteProps>
  ): Promise<Types.Note> {
    const client = this.manager.getClient(storageId)
    const createdNote = await client.createNote(path, note)

    this.assertStorageExists(storageId)
    const storage = this.storageMap.get(storageId) as Storage
    storage.addNote(createdNote)

    return createdNote
  }

  async updateNote(
    storageId: string,
    noteId: string,
    note: Partial<Types.EditableNoteProps>
  ): Promise<Types.Note> {
    const client = this.manager.getClient(storageId)
    if (note.content != null) {
      const { title, tags } = getMetaData(note.content)
      note = {
        title,
        tags,
        ...note
      }
    }
    const updatedNote = await client.updateNote(noteId, note)

    this.assertStorageExists(storageId)
    const storage = this.storageMap.get(storageId) as Storage
    storage.addNote(updatedNote)

    return updatedNote
  }

  async removeNote(name: string, id: string): Promise<void> {
    const client = this.manager.getClient(name)

    await client.removeNote(id)

    this.assertStorageExists(name)
    const storage = this.storageMap.get(name) as Storage
    storage.removeNote(id)
  }

  assertStorageExists(name: string) {
    if (!this.storageMap.has(name)) {
      throw new Error('The storage does not exist in DataStore')
    }
  }

  @action
  addStorageToMap(name: string, storage: Storage) {
    this.storageMap.set(name, storage)
  }

  @action
  removeStorageFromMap(name: string) {
    this.storageMap.delete(name)
  }
}
