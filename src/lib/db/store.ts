import { createStoreContext } from '../context'
import { localLiteStorage } from 'ltstrg'

import { useRouter, usePathnameWithoutNoteId } from '../router'
import { wrapDbStoreWithAnalytics } from '../analytics'
import { createDbStoreCreator } from './createStore'

export const {
  StoreProvider: DbProvider,
  useStore: useDb,
} = createStoreContext(
  wrapDbStoreWithAnalytics(
    createDbStoreCreator(
      localLiteStorage,
      useRouter,
      usePathnameWithoutNoteId,
      'idb'
    )
  )
)
