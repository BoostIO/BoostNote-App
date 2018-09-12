import DataStore from '../../stores/DataStore'
import ClientManager from '../../lib/db/ClientManager'
import {
  createMockClientManager,
  MemoryStorage
} from '../utils'
import Storage from '../../stores/Storage'

describe('DataStore', () => {
  describe('constructor', () => {
    it('uses optional manager', () => {
      const manager = new ClientManager()
      const data = new DataStore({
        manager
      })

      expect(data.manager).toBe(manager)
    })
  })

  describe('initStorage', () => {
    it('initializes a storage instance', async () => {
      const manager = await createMockClientManager()
      await manager.addClient('test')
      const data = new DataStore({
        manager
      })

      await data.init()

      expect(data.storageMap.get('test')).not.toBeUndefined()
    })

    it('sets notes and folders to the storage instance', async () => {
      const manager = await createMockClientManager()
      const client = await manager.addClient('test')
      await client.putNote('test-note', {
        title: 'test',
        content: 'test',
        folder: '/',
        tags: []
      })
      const data = new DataStore({
        manager
      })

      await data.init()

      expect(data.storageMap.get('test')).not.toBeUndefined()
      expect((data.storageMap.get('test') as Storage).noteMap.get('boost:note:test-note')).toMatchObject({
        _id: 'boost:note:test-note',
        title: 'test',
        content: 'test'
      })
    })
  })
})
