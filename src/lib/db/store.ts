import { createStoreContext } from '../context'
import { localLiteStorage } from 'ltstrg'
import { createDbStoreCreator } from './createStore'

export const {
  StoreProvider: DbProvider,
  useStore: useDb,
} = createStoreContext(createDbStoreCreator(localLiteStorage))
