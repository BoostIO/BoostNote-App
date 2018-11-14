import ClientManager, { DBAdapter } from '../../lib/db/ClientManager'
import MemoryStorage from './MemoryStorage'

export async function createMockClientManager(): Promise<ClientManager> {
  const manager = new ClientManager({
    storage: new MemoryStorage(),
    adapter: DBAdapter.memory
  })

  await manager.init()

  return manager
}
