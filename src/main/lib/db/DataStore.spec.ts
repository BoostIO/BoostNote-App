import { DataStore } from './DataStore'
import ClientManager, { DBAdapter } from '../db/ClientManager'
import MemoryStorage from '../../specs/utils/MemoryStorage'

describe('DataStore', () => {
  let manager: ClientManager
  beforeEach(async () => {
    manager = new ClientManager({
      storage: new MemoryStorage(),
      adapter: DBAdapter.memory
    })
  })
  afterEach(async () => {
    await manager.destroyAllDB()
  })

  describe('constructor', () => {
    it('uses optional manager', () => {
      // When
      const data = new DataStore({
        manager
      })

      // Then
      expect(data.manager).toBe(manager)
    })
  })

  describe('initStorage', () => {
    it('inits manager', async () => {
      // Given
      const data = new DataStore({
        manager
      })
      manager.init = jest.fn()

      // When
      await data.init()

      // Then
      expect(manager.init).toBeCalled()
    })

    it('sets notes and folders to the storage instance', async () => {
      // Given
      const client = await manager.addClient('test')
      const note = await client.createNote('/', {
        content: 'test'
      })
      const data = new DataStore({
        manager
      })

      // When
      await data.init()

      expect(
        data.storageMap.get(client.id)!.noteMap.get(note._id)
      ).toMatchObject({
        content: 'test'
      })
    })
  })

  describe('createNote', () => {
    it('creates a note', async () => {
      // Given
      const { data, storageId } = await prepare(manager)
      await data.init()

      // When
      const note = await data.createNote(storageId, '/', {
        content: 'test'
      })

      expect(
        data.storageMap.get(storageId)!.noteMap.get(note._id)
      ).toMatchObject({
        content: 'test'
      })
    })
  })

  describe('updateFolder', () => {
    it('sets a folder', async () => {
      // Given
      const { data, storageId } = await prepare(manager)
      await data.createFolder(storageId, '/test', {})

      // When
      await data.updateFolder(storageId, '/test', {})

      // THen
      expect(
        data.storageMap.get(storageId)!.folderMap.get('folder:/test')
      ).toMatchObject({
        _id: 'folder:/test'
      })
    })
  })

  describe('removeFolder', () => {
    it('removes a folder', async () => {
      // Given
      const { data, storageId } = await prepare(manager)
      await data.createFolder(storageId, '/test', {})

      // When
      await data.removeFolder(storageId, '/test')

      // Then
      expect(
        data.storageMap.get(storageId)!.folderMap.has('folder:/test')
      ).toBe(false)
    })
  })
})

async function prepare(manager: ClientManager) {
  const data = new DataStore({
    manager
  })
  const client = await manager.addClient('test')
  const storageId = client.id
  await data.init()

  return {
    data,
    storageId
  }
}
