import Client from './Client'
import PouchDB from './PouchDB'
import uuid from './uuid'

export const reservedStorageNameRegex = /[\/?#<>:"\\|?*\x00-\x1F]/

export enum DBAdapter {
  memory = 'memory',
  idb = 'idb'
}

export interface ClientManagerOptions {
  storage?: Storage
  adapter?: DBAdapter
}

const BOOST_STORAGE_META = 'BOOST_STORAGE_META'

interface SerializedStorageMeta {
  id: string
  name: string
}

export default class ClientManager {
  private webStorage: Storage = localStorage
  private storageNameIdMap: Map<string, string>
  private storageIdClientMap: Map<string, Client>
  private adapter: DBAdapter = DBAdapter.idb

  constructor(options?: ClientManagerOptions) {
    options = {
      ...options
    }
    if (options.storage != null) {
      this.webStorage = options.storage
    }
    if (options.adapter != null) {
      this.adapter = options.adapter
    }
    this.storageIdClientMap = new Map()
    this.storageNameIdMap = new Map()
  }

  getStorageId(name: string): string {
    if (this.storageNameIdMap.has(name)) {
      return this.storageNameIdMap.get(name)!
    }
    throw new Error(`${name} is not registered yet.`)
  }

  getClient(clientId: string): Client {
    if (clientId == null || !this.storageIdClientMap.has(clientId)) {
      throw new Error(`The client id, "${clientId}", is not added yet.`)
    }
    return this.storageIdClientMap.get(clientId) as Client
  }

  save() {
    const storageNameIdEntries = [...this.storageNameIdMap.entries()]
    const storageMetaList: SerializedStorageMeta[] = storageNameIdEntries.map(
      ([name, id]) => ({
        id,
        name
      })
    )
    const stringifiedStorageMetaList = JSON.stringify(storageMetaList)

    this.webStorage.setItem(BOOST_STORAGE_META, stringifiedStorageMetaList)
  }

  getStorageMetaList() {
    const storageNameIdEntries = [...this.storageNameIdMap.entries()]
    const storageMetaList: SerializedStorageMeta[] = storageNameIdEntries.map(
      ([name, id]) => ({
        id,
        name
      })
    )

    return storageMetaList
  }

  load() {
    let stringifiedStorageMetaList = this.webStorage.getItem(BOOST_STORAGE_META)
    if (stringifiedStorageMetaList == null) stringifiedStorageMetaList = '[]'
    const storageMetaList: SerializedStorageMeta[] = JSON.parse(
      stringifiedStorageMetaList
    )
    const storageNameIdEntries = storageMetaList.map(
      ({ id, name }) => [name, id] as [string, string]
    )
    this.storageNameIdMap = new Map(storageNameIdEntries)
  }

  async init() {
    this.load()
    const storageNameIdEntries = [...this.storageNameIdMap.entries()]
    await Promise.all(
      storageNameIdEntries.map(async ([name, id]) => {
        const client = await this.initClient(id, name)
        if (client != null) {
          this.storageIdClientMap.set(id, client)
        }
      })
    )
  }

  async initClient(clientId: string, clientName: string) {
    const db = new PouchDB(clientId, {
      adapter: this.adapter
    })
    const newClient = new Client(db, clientId, clientName)

    try {
      await newClient.init()
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(error)
      return null
    }

    return newClient
  }

  async removeClient(clientId: string) {
    const client = this.getClient(clientId)
    const clientName = client.name
    await client.destroyDB()

    this.storageNameIdMap.delete(clientName)
    this.storageIdClientMap.delete(clientId)
  }

  async addClient(name: string): Promise<Client> {
    this.assertClientName(name)
    if (this.storageNameIdMap.has(name))
      throw new Error(`${name} is already taken.`)
    const storageId = uuid()
    const newClient = await this.initClient(storageId, name)

    if (newClient == null) throw new Error('Failed to init new storage client.')

    this.storageIdClientMap.set(storageId, newClient)
    this.storageNameIdMap.set(name, storageId)
    this.save()

    await newClient.init()

    return newClient
  }

  assertClientName(name: string) {
    if (reservedStorageNameRegex.test(name))
      throw new Error('The given client name is invalid.')
  }

  async destroyAllDB() {
    const clientEntries = [...this.storageIdClientMap.entries()]

    await Promise.all(
      clientEntries.map(async ([, client]) => {
        await client.destroyDB()
      })
    )
  }
}
