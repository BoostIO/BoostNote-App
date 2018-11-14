import DataStore from '../../stores/DataStore'
import ClientManager from '../../lib/db/ClientManager'
import { createMockClientManager } from '../utils'
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
      const note = await client.createNote('/', {
        content: 'test'
      })
      const data = new DataStore({
        manager
      })

      await data.init()

      expect(data.storageMap.get('test')).not.toBeUndefined()
      expect(
        (data.storageMap.get('test') as Storage).noteMap.get(note._id)
      ).toMatchObject({
        content: 'test'
      })
    })
  })

  describe('createNote', () => {
    it('creates a note', async () => {
      // Given
      const manager = await createMockClientManager()
      await manager.addClient('test')
      const data = new DataStore({
        manager
      })
      await data.init()

      // When
      const note = await data.createNote('test', '/', {
        content: 'test'
      })

      expect(data.storageMap.get('test')).not.toBeUndefined()
      expect(
        (data.storageMap.get('test') as Storage).noteMap.get(note._id)
      ).toMatchObject({
        content: 'test'
      })
    })
  })

  describe('updateFolder', () => {
    it('sets a folder', async () => {
      // Given
      const manager = await createMockClientManager()
      await manager.addClient('test')
      const data = new DataStore({
        manager
      })
      await data.init()
      await data.createFolder('test', '/test', {})

      // When
      await data.updateFolder('test', '/test', {})

      // THen
      expect(data.storageMap.get('test')).not.toBeUndefined()
      expect(
        (data.storageMap.get('test') as Storage).folderMap.get(
          'boost:folder:/test'
        )
      ).toMatchObject({
        _id: 'boost:folder:/test'
      })
    })
  })
})
