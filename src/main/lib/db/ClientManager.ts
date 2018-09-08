import Client from './Client'

export interface ClientManagerOptions {
  storage?: Storage
  adapter?: 'memory' | 'indexeddb'
}

const defaultOptions: ClientManagerOptions = {
  adapter: 'indexeddb'
}

const BOOST_DB_NAMES = 'BOOST_DB_NAMES'
const defaultDBNames = ['default']

export default class ClientManager {
  private storage: Storage
  private clientMap: Map<string, Client>
  private adapter: 'memory' | 'indexeddb'

  constructor (options?: ClientManagerOptions) {
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

  addClient (clientName: string) {
    const newClient = new Client(clientName, {
      adapter: this.adapter
    })
    this.clientMap.set(clientName, newClient)

    const clientNameSet = new Set(this.getAllClientNames())
    clientNameSet.add(clientName)
    this.setAllClientNames(clientNameSet)

    return newClient
  }

  getClient (clientName: string): Client {
    if (!this.clientMap.has(clientName)) throw new Error(`The client, "${clientName}", is not added yet.`)
    return this.clientMap.get(clientName) as Client
  }

  getAllClientNames () {
    try {
      const rawData = this.storage.getItem(BOOST_DB_NAMES)
      if (rawData == null) return defaultDBNames
      return [...JSON.parse(rawData)].filter(key => typeof key === 'string')
    } catch (error) {
      return defaultDBNames
    }
  }

  setAllClientNames (names: string[] | Set<string>) {
    names = [...names]
    this.storage.setItem(BOOST_DB_NAMES, JSON.stringify(names))
  }

  init () {
    const names = this.getAllClientNames()
    names.forEach(name => {
      this.addClient(name)
    })
  }

  removeClient (clientName: string) {
    const clientNameSet = new Set(this.getAllClientNames())
    clientNameSet.delete(clientName)
    this.setAllClientNames(clientNameSet)
    return this.clientMap.delete(clientName)
  }
}
