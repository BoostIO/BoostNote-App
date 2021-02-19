import { createStoreContext } from '../../utils/context'
import { useApiTokensStore } from './store'

export const {
  StoreProvider: ApiTokensProvider,
  useStore: useApiTokens,
} = createStoreContext(useApiTokensStore, 'API Tokens')

export { default as withApiTokens } from './withApiTokens'
