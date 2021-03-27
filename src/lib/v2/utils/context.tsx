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
      throw new Error(`You have forgotten to use '${storeName}' provider.`)
    }
    return store
  }

  return {
    StoreProvider,
    useStore,
  }
}

/**
 * Combine providers into a single FC
 *
 * @param providers Provider component list
 *
 * ```
 * combineProviders(A, B, C)
 * // Same to
 * ({ children }) => (<C><B><A>{children}</A></B></C>)
 * ```
 *
 */
export function combineProviders(
  ...providers: React.ComponentType<any>[]
): React.FC {
  return ({ children }) => {
    return providers.reduce(
      (combined, Provider) => <Provider>{combined}</Provider>,
      children
    ) as React.ReactElement
  }
}
