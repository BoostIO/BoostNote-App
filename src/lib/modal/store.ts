import { createStoreContext } from '../utils/context'
import { useState, useCallback } from 'react'
import { ModalsContentOptions, ModalsContext } from './types'
export * from './types'

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
