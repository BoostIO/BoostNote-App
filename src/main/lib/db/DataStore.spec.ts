import { DataStore } from './DataStore'
import Storage from './Storage'
import ClientManager, { DBAdapter } from '../db/ClientManager'
import MemoryStorage from '../../specs/utils/MemoryStorage'
import PouchDB from '../db/PouchDB'

export async function prepare(): Promise<ClientManager> {
  const manager = new ClientManager({
    storage: new MemoryStorage(),
    adapter: DBAdapter.memory
  })

  await manager.init()
  await manager.addClient('test')

  return manager
}

// TODO: Implement tests for all apis
describe('DataStore', () => {
  afterEach(async () => {
    const db = new PouchDB('test', {
      adapter: 'memory'
    })
    await db.destroy()
  })
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
      const manager = await prepare()
      const data = new DataStore({
        manager
      })

      await data.init()

      expect(data.storageMap.get('test')).not.toBeUndefined()
    })

    it('sets notes and folders to the storage instance', async () => {
      const manager = await prepare()
      const client = await manager.getClient('test')
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
      const manager = await prepare()
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
      const manager = await prepare()
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
        (data.storageMap.get('test') as Storage).folderMap.get('folder:/test')
      ).toMatchObject({
        _id: 'folder:/test'
      })
    })
  })

  describe('removeFolder', () => {
    it('removes a folder', async () => {
      // Given
      const manager = await prepare()
      const data = new DataStore({
        manager
      })
      await data.init()
      await data.createFolder('test', '/test', {})

      // When
      await data.removeFolder('test', '/test')

      // Then
      expect(
        (data.storageMap.get('test') as Storage).folderMap.has('folder:/test')
      ).toBe(false)
    })
  })
})
