import { createStoreContext } from '../../utils/context'
import { useState, useCallback } from 'react'
import { ModalsContext, ModalsOptions } from './types'
export * from './types'

const defaultOptions: ModalsOptions = {
  closable: true,
  classNames: 'large',
}

function useModalStore(): ModalsContext {
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null)
  const [options, setOptions] = useState<ModalsOptions>({ closable: true })

  const openModal = useCallback(
    (content: JSX.Element, options?: Partial<ModalsOptions>) => {
      setModalContent(content)
      setOptions({ ...defaultOptions, ...options })
    },
    []
  )

  const closeModal = useCallback(() => {
    setModalContent(null)
  }, [])

  return {
    modalContent,
    modalOptions: options,
    closeModal,
    openModal,
  }
}

export const {
  StoreProvider: ModalProvider,
  useStore: useModal,
} = createStoreContext(useModalStore, 'modal')
