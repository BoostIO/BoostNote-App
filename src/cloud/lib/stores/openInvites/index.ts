import { createStoreContext } from '../../utils/context'
import { useOpenInvitesStore } from './store'

export const {
  StoreProvider: OpenInvitesProvider,
  useStore: useOpenInvites,
} = createStoreContext(useOpenInvitesStore, 'Beta Registration')

export { default as withOpenInvites } from './withOpenInvites'
