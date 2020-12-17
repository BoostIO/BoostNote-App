import { useToggle } from 'react-use'
import { createStoreContext } from './context'

function useCreateWorkspaceModalStore() {
  const [showCreateWorkspaceModal, toggleShowCreateWorkspaceModal] = useToggle(
    false
  )

  return {
    showCreateWorkspaceModal,
    toggleShowCreateWorkspaceModal,
  }
}

export const {
  StoreProvider: CreateWorkspaceModalProvider,
  useStore: useCreateWorkspaceModal,
} = createStoreContext(useCreateWorkspaceModalStore, 'createWorkspaceModal')
