import ClientManager from '../../../lib/db/ClientManager'
import MemoryStorage from '../../utils/MemoryStorage'
import Client from '../../../lib/db/Client'

describe('ClientManager', () => {
  let manager: ClientManager
  beforeEach(() => {
    manager = new ClientManager({
      storage: new MemoryStorage(),
      adapter: 'memory'
    })
  })

  describe('#getAllClientNames', () => {
    it('returns all names of clients', async () => {
      // Given
      await manager.addClient('test')

      // When
      const names = manager.getAllClientNames()

      // Then
      expect(names).toEqual(['default', 'test'])
    })
  })

  describe('#setAllClientNames', () => {
    it('sets all names of clients', () => {
      // When
      manager.setAllClientNames(['test'])

      // Then
      const names = manager.getAllClientNames()
      expect(names).toEqual(['test'])
    })
  })

  describe('#addClient', () => {
    it('creates new client', async () => {
      // When
      const client = await manager.addClient('test')

      // Then
      expect(client.name).toEqual('test')
      const names = manager.getAllClientNames()
      expect(names).toEqual(['default', 'test'])
    })
  })

  describe('#getClient', () => {
    it('returns a client', async () => {
      await manager.addClient('test')

      const client = manager.getClient('test') as Client

      expect(client.name).toEqual('test')
    })

    it('throws an error if the client does not exist', () => {
      expect(() => {
        manager.getClient('test')
      }).toThrowError('The client, "test", is not added yet.')
    })
  })

  describe('#removeClient', () => {
    it('removes a client', async () => {
      // Given
      await manager.addClient('test')

      // When
      manager.removeClient('test')

      // Then
      expect(() => {
        manager.getClient('test')
      }).toThrowError('The client, "test", is not added yet.')
      const noteNames = manager.getAllClientNames()
      expect(noteNames).toEqual(['default'])
    })
  })

  describe('#init', () => {
    it('register all repository', async () => {
      // When
      await manager.init()

      // Then
      const client = manager.getClient('default')
      expect(client).toBeDefined()
    })
  })
})
