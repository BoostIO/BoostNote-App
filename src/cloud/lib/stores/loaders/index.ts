import { createStoreContext } from '../../utils/context'
import { useLoaderStore } from './store'

export const {
  StoreProvider: LoaderPropsProvider,
  useStore: useLoaderProps,
} = createStoreContext(useLoaderStore, 'Loader props')

export { default as withLoaderProps } from './withLoaderProps'
