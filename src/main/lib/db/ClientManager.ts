import Client from './Client'
import PouchDB from './PouchDB'

export const reservedStorageNameRegex = /[\/?#<>:"\\|?*\x00-\x1F]/

export enum DBAdapter {
  memory = 'memory',
  idb = 'idb'
}

export interface ClientManagerOptions {
  storage?: Storage
  adapter?: DBAdapter
}

const defaultOptions: ClientManagerOptions = {
  adapter: DBAdapter.idb
}

const BOOST_DB_NAMES = 'BOOST_DB_NAMES'
const defaultDBNames = ['default']

export default class ClientManager {
  private storage: Storage = localStorage
  private clientMap: Map<string, Client>
  private adapter: DBAdapter = DBAdapter.idb

  constructor(options?: ClientManagerOptions) {
    options = {
      ...defaultOptions,
      ...options
    }
    if (options.storage != null) {
      this.storage = options.storage
    }
    if (options.adapter != null) {
      this.adapter = options.adapter
    }
    this.clientMap = new Map()
  }

  async addClient(clientName: string) {
    this.assertClientName(clientName)
    const db = new PouchDB(clientName, {
      adapter: this.adapter
    })
    const newClient = new Client(db)

    await newClient.init()

    this.clientMap.set(clientName, newClient)

    const clientNameSet = new Set(this.getAllClientNames())
    if (!clientNameSet.has(clientName)) {
      clientNameSet.add(clientName)
      this.setAllClientNames(clientNameSet)
    }

    return newClient
  }

  getClient(clientName: string): Client {
    if (!this.clientMap.has(clientName)) {
      throw new Error(`The client, "${clientName}", is not added yet.`)
    }
    return this.clientMap.get(clientName) as Client
  }

  getAllClientNames() {
    try {
      const rawData = this.storage.getItem(BOOST_DB_NAMES)
      if (rawData == null) {
        return defaultDBNames
      }
      return [...JSON.parse(rawData)].filter(key => typeof key === 'string')
    } catch (error) {
      return defaultDBNames
    }
  }

  setAllClientNames(names: string[] | Set<string>) {
    names = [...names]
    this.storage.setItem(BOOST_DB_NAMES, JSON.stringify(names))
  }

  async init() {
    const names = this.getAllClientNames()
    await Promise.all(
      names.map(async name => {
        const client = await this.initClient(name)
        if (client != null) {
          this.clientMap.set(name, client)
        }
      })
    )
  }

  async initClient(clientName: string) {
    this.assertClientName(clientName)
    const db = new PouchDB(clientName, {
      adapter: this.adapter
    })
    const newClient = new Client(db)

    try {
      await newClient.init()
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(error)
      return null
    }

    return newClient
  }

  async removeClient(clientName: string) {
    const client = this.getClient(clientName)
    await client.destroyDB()

    const clientNameSet = new Set(this.getAllClientNames())
    clientNameSet.delete(clientName)
    this.setAllClientNames(clientNameSet)
    return this.clientMap.delete(clientName)
  }

  assertClientName(name: string) {
    if (reservedStorageNameRegex.test(name))
      throw new Error('The given client name is invalid.')
  }
}
