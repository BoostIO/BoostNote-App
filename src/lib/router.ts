import { createStoreContext } from './context'
import { useState, useCallback, useEffect } from 'react'
import { Location, normalizeLocation } from './url'
import {
  createBrowserHistory,
  createHashHistory,
  LocationDescriptorObject,
  LocationState,
} from 'history'
import { parse as parseQuery } from 'querystring'
import { appIsElectron } from './platform'

const browserHistory = appIsElectron
  ? createHashHistory<unknown>()
  : createBrowserHistory<unknown>()

export interface RouterStore extends Location {
  push(path: string, state?: LocationState): void
  push(location: LocationDescriptorObject): void
  replace(path: string): void
  go(count: number): void
  goBack(): void
  goForward(): void
}

const initialLocation = normalizeLocation({
  pathname: appIsElectron ? '/app' : browserHistory.location.pathname,
  hash: browserHistory.location.hash,
  query: parseQuery(browserHistory.location.search),
})

function useRouteStore(): RouterStore {
  const [location, setLocation] = useState(initialLocation)

  const push = browserHistory.push

  const replace = useCallback((urlStr: string) => {
    browserHistory.replace(urlStr)
  }, [])

  const go = useCallback((count: number) => {
    browserHistory.go(count)
  }, [])

  const goBack = useCallback(() => go(-1), [go])
  const goForward = useCallback(() => go(1), [go])

  useEffect(() => {
    return browserHistory.listen((blocation) => {
      setLocation({
        pathname: blocation.pathname,
        hash: blocation.hash,
        query: parseQuery(blocation.search),
      })
    })
  }, [])

  return {
    ...location,
    push,
    replace,
    go,
    goBack,
    goForward,
  }
}

export const {
  StoreProvider: RouterProvider,
  useStore: useRouter,
} = createStoreContext(useRouteStore)
