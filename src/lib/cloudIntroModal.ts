import { useToggle } from 'react-use'
import { createStoreContext } from './context'

function useCloudIntroModalStore() {
  const [showingCloudIntroModal, toggleShowingCloudIntroModal] = useToggle(
    false
  )

  return {
    showingCloudIntroModal,
    toggleShowingCloudIntroModal,
  }
}

export const {
  StoreProvider: CloudIntroModalProvider,
  useStore: useCloudIntroModal,
} = createStoreContext(useCloudIntroModalStore, 'createIntroModal')
