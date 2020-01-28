import { createStoreContext } from '../../lib/context'
import { localLiteStorage } from 'ltstrg'

import { useRouter, usePathnameWithoutNoteId } from './router'
import { wrapDbStoreWithAnalytics } from '../../lib/analytics'
import { createDbStoreCreator } from '../../lib/db/createStore'

export const {
  StoreProvider: DbProvider,
  useStore: useDb
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
