import ClientManager, { DBAdapter } from './ClientManager'
import MemoryStorage from '../../specs/utils/MemoryStorage'
import Client from './Client'

describe('ClientManager', () => {
  let manager: ClientManager
  beforeEach(() => {
    manager = new ClientManager({
      storage: new MemoryStorage(),
      adapter: DBAdapter.memory
    })
  })

  describe('#getStorageId', () => {
    it('returns storage id for name', async () => {
      // Given
      const { id } = await manager.addClient('test')

      // When
      const result = manager.getStorageId('test')

      // Then
      expect(result).toBe(id)
    })

    it('throws if the storage is not registered', () => {
      // When
      const run = () => {
        manager.getStorageId('test')
      }

      // Then
      expect(run).toThrow()
    })
  })

  describe('#getClient', () => {
    it('returns storage client', async () => {
      // Given
      const { id } = await manager.addClient('test')

      // When
      const client = manager.getClient(id)

      // Then
      expect(client).toBeInstanceOf(Client)
    })
  })
})
