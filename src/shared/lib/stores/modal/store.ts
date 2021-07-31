import { createStoreContext } from '../../utils/context'
import { useState, useCallback } from 'react'
import {
  ModalsContext,
  ModalOpeningOptions,
  ModalElement,
  ContextModalOpeningOptions,
} from './types'
export * from './types'

function useModalStore(): ModalsContext {
  const [modals, setModals] = useState<ModalElement[]>([])

  const openContextModal = useCallback(
    (
      event: React.MouseEvent<Element>,
      content: React.ReactNode,
      options: ContextModalOpeningOptions = {}
    ) => {
      const currentTargetRect = event.currentTarget.getBoundingClientRect()
      const modal: ModalElement = {
        content,
        ...options,
        width: options.width || 400,
        position: {
          left: currentTargetRect.left,
          right: currentTargetRect.right,
          top: currentTargetRect.top,
          bottom: currentTargetRect.bottom,
          alignment: options.alignment || 'bottom-left',
        },
      }

      console.log(modal)
      setModals([modal])
    },
    []
  )

  const openModal = useCallback(
    (content: React.ReactNode, options: ModalOpeningOptions = {}) => {
      const modal: ModalElement = {
        content,
        ...options,
        width: options.width || 'default',
      }
      if (!options.keepAll) {
        setModals([modal])
      } else {
        setModals((prev) => {
          const newArray = prev.slice()
          newArray.push(modal)
          return newArray
        })
      }
    },
    []
  )

  const closeAllModals = useCallback(() => {
    setModals([])
  }, [])

  const closeModal = useCallback((index: number, collapse?: boolean) => {
    setModals((modals) =>
      collapse ? modals.slice(0, index - 1) : modals.splice(index, 1)
    )
  }, [])

  const closeLastModal = useCallback(() => {
    setModals((prev) => {
      const arr = prev.slice()
      const closedModal = arr.pop()

      if (closedModal != null && closedModal.onClose != null) {
        closedModal.onClose()
      }

      return arr
    })
  }, [])

  return {
    modals,
    openContextModal,
    closeModal,
    closeAllModals,
    closeLastModal,
    openModal,
  }
}

export const {
  StoreProvider: V2ModalProvider,
  useStore: useModal,
} = createStoreContext(useModalStore, 'modal')
