import { createStoreContext } from '../utils/context'
import { parseUrl, normalizeLocation } from './utils'
import { useState, useCallback, useEffect } from 'react'
import { Location } from './types'

export interface RouterStore extends Location {
  push: (path: string) => void
  replace: (path: string) => void
  go: (count: number) => void
  goBack: () => void
  goForward: () => void
}

const initialLocation = normalizeLocation(parseUrl(window.location.href))

function useRouteStore(): RouterStore {
  const [location, setLocation] = useState(initialLocation)

  const push = useCallback((urlStr: string) => {
    const location = parseUrl(urlStr)

    setLocation(location)
    history.pushState(null, document.title, urlStr)
  }, [])

  const replace = useCallback((urlStr: string) => {
    const location = parseUrl(urlStr)

    setLocation(location)
    history.pushState(null, document.title, urlStr)
  }, [])

  const go = useCallback((count: number) => {
    history.go(count)
  }, [])

  const goBack = useCallback(() => go(-1), [go])
  const goForward = useCallback(() => go(1), [go])

  const onPop = useCallback(() => {
    setLocation(normalizeLocation(parseUrl(window.location.href)))
  }, [setLocation])

  useEffect(() => {
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
    }
  }, [onPop])

  return {
    ...location,
    push,
    replace,
    go,
    goBack,
    goForward
  }
}

export const {
  StoreProvider: RouterProvider,
  useStore: useRouter
} = createStoreContext(useRouteStore)
