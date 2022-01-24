import { createStoreContext } from '../../utils/context'
import { useBetaRegistrationStore } from './store'

export const {
  StoreProvider: BetaRegistrationProvider,
  useStore: useBetaRegistration,
} = createStoreContext(useBetaRegistrationStore, 'Beta Registration')

export { default as withBetaRegistration } from './withBetaRegistration'
