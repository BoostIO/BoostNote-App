import { createStoreContext } from '../../utils/context'
import { useServiceConnectionsStore } from './store'

export const {
  StoreProvider: ServiceConnectionProvider,
  useStore: useServiceConnections,
} = createStoreContext(useServiceConnectionsStore, 'Service Connections')

export { default as withServiceConnections } from './withServiceConnections'
