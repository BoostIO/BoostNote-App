import { useState, useCallback } from 'react'
import { ModalsContentOptions, ModalsContext } from './types'
import { createStoreContext } from '../utils/context'
export * from './types'

function useModalsStore(): ModalsContext {
  const [
    modalsContent,
    setModalsContent
  ] = useState<ModalsContentOptions | null>(null)

  const closeModals = useCallback(() => {
    setModalsContent(null)
  }, [])

  return {
    modalsContent,
    closeModals,
    setModalsContent
  }
}

export const {
  StoreProvider: ModalsProvider,
  useStore: useModals
} = createStoreContext(useModalsStore, 'modals')
