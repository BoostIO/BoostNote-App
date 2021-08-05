import { createStoreContext } from '../context'
import { localLiteStorage } from 'ltstrg'

import { useRouter } from '../router'
import { createDbStoreCreator } from './createStore'

export const {
  StoreProvider: DbProvider,
  useStore: useDb,
} = createStoreContext(createDbStoreCreator(localLiteStorage, useRouter))
