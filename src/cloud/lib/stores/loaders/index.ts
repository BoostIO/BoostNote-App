import { createStoreContext } from '../../utils/context'
import { useLoaderStore } from './store'

export const {
  StoreProvider: LoaderProvider,
  useStore: useServiceConnections,
} = createStoreContext(useLoaderStore, 'Provider')

export { default as withLoaderProps } from './withLoaderProps'
