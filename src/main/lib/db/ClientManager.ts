import Client from './Client'
import PouchDB from './PouchDB'

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
    const db = new PouchDB(clientName, {
      adapter: this.adapter
    })
    const newClient = new Client(db)
    this.clientMap.set(clientName, newClient)

    const clientNameSet = new Set(this.getAllClientNames())
    clientNameSet.add(clientName)
    this.setAllClientNames(clientNameSet)

    await newClient.init()

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
      names.map(name => {
        return this.addClient(name)
      })
    )
  }

  async removeClient(clientName: string) {
    const client = this.getClient(clientName)
    await client.destroyDB()

    const clientNameSet = new Set(this.getAllClientNames())
    clientNameSet.delete(clientName)
    this.setAllClientNames(clientNameSet)
    return this.clientMap.delete(clientName)
  }
}
