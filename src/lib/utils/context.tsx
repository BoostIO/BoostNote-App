import React, { createContext, useContext } from 'react'

export function createStoreContext<R>(
  storeCreator: () => R,
  storeName?: string
) {
  const context = createContext<R | null>(null)

  const StoreProvider: React.FC = ({ children }) => (
    <context.Provider value={storeCreator()}>{children}</context.Provider>
  )

  const useStore = () => {
    const store = useContext(context)
    if (store == null) {
      throw new Error(`You have forgot to use '${storeName}' provider.`)
    }
    return store
  }

  return {
    StoreProvider,
    useStore
  }
}
