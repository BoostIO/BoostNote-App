import { createStoreContext } from './context'
import { useState, useCallback } from 'react'

export type ModalsContentOptions = 'download-app'

export interface ModalsContext {
  modalContent: ModalsContentOptions | null
  openModal: (options: ModalsContentOptions) => void
  closeModal: () => void
}

function useModalStore(): ModalsContext {
  const [modalContent, setModalContent] = useState<ModalsContentOptions | null>(
    null
  )

  const openModal = useCallback((content: ModalsContentOptions) => {
    setModalContent(content)
  }, [])

  const closeModal = useCallback(() => {
    setModalContent(null)
  }, [])

  return {
    modalContent,
    closeModal,
    openModal
  }
}

export const {
  StoreProvider: ModalProvider,
  useStore: useModal
} = createStoreContext(useModalStore, 'modal')
