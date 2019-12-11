import { createStoreContext } from '../utils/context'
import { useState, useCallback } from 'react'
import { ModalsContentOptions, ModalsContext } from './types'
export * from './types'

function useModalsStore(): ModalsContext {
  const [
    modalsContent,
    setModalsContent
  ] = useState<ModalsContentOptions | null>(null)

  const openModals = useCallback((content: ModalsContentOptions) => {
    setModalsContent(content)
  }, [])

  const closeModals = useCallback(() => {
    setModalsContent(null)
  }, [])

  return {
    modalsContent,
    closeModals,
    openModals
  }
}

export const {
  StoreProvider: ModalsProvider,
  useStore: useModals
} = createStoreContext(useModalsStore, 'modals')
