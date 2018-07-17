import Client from './Client'

export interface ClientManagerOptions {
  storage: Storage
}

const BOOST_DB_NAMES = 'BOOST_DB_NAMES'
const defaultDBNames = ['default']

export default class ClientManager {
  private storage: Storage
  private clientMap: Map<string, Client>

  constructor (options?: ClientManagerOptions) {
    if (options != null) {
      this.storage = options.storage == null
       ? window.localStorage
       : options.storage
    }
    this.clientMap = new Map()
  }

  addClient (clientName: string) {
    const newClient = new Client(clientName)
    this.clientMap.set(clientName, newClient)

    const clientNameSet = new Set(this.getAllClientNames())
    clientNameSet.add(clientName)
    this.setAllClientNames(clientNameSet)

    return newClient
  }

  getClient (clientName: string) {
    return this.clientMap.get(clientName)
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
