import ClientManager from '../../../lib/db/ClientManager'
import MemoryStorage from './MemoryStorage'
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
    it('returns all names of clients', () => {
      // Given
      manager.addClient('test')

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
    it('creates new client', () => {
      // When
      const client = manager.addClient('test')

      // Then
      expect(client.name).toEqual('test')
      const names = manager.getAllClientNames()
      expect(names).toEqual(['default', 'test'])
    })
  })

  describe('#getClient', () => {
    it('returns a client', () => {
      manager.addClient('test')

      const client = manager.getClient('test') as Client

      expect(client.name).toEqual('test')
    })

    it('returns undefined if the client does not exist', () => {
      const client = manager.getClient('test')

      expect(client).toBeUndefined()
    })
  })

  describe('#removeClient', () => {
    it('removes a client', () => {
      // Given
      manager.addClient('test')

      // When
      manager.removeClient('test')

      // Then
      const client = manager.getClient('test')
      expect(client).toBe(undefined)
      const noteNames = manager.getAllClientNames()
      expect(noteNames).toEqual(['default'])
    })
  })

  describe('#init', () => {
    it('register all repository', () => {
      // When
      manager.init()

      // Then
      const client = manager.getClient('default')
      expect(client).toBeDefined()
    })
  })
})
