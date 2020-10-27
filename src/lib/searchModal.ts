import { useToggle } from 'react-use'
import { createStoreContext } from './context'

function useSearchModalStore() {
  const [showSearchModal, toggleShowSearchModal] = useToggle(false)

  return {
    showSearchModal,
    toggleShowSearchModal,
  }
}

export const {
  StoreProvider: SearchModalProvider,
  useStore: useSearchModal,
} = createStoreContext(useSearchModalStore, 'searchModal')
