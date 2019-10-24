import { useState, useCallback } from 'react'
import { createStoreContext } from '../utils/context'

function usePreferencesStore() {
  const [closed, setClosed] = useState(true)
  const toggleClosed = useCallback(() => {
    if (closed) {
      setClosed(false)
    } else {
      setClosed(true)
    }
  }, [closed, setClosed])

  return {
    closed,
    setClosed,
    toggleClosed
  }
}

export const {
  StoreProvider: PreferencesProvider,
  useStore: usePreferences
} = createStoreContext(usePreferencesStore, 'preferences')
