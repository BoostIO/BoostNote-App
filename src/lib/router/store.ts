import { createStoreContext } from '../context'
import { normalizeLocation } from './utils'
import { useState, useCallback, useEffect } from 'react'
import { Location } from './types'
import { createBrowserHistory, createHashHistory } from 'history'
import { parse as parseQuery } from 'querystring'
import { appIsElectron } from '../platform'

const browserHistory = appIsElectron
  ? createHashHistory()
  : createBrowserHistory()

export interface RouterStore extends Location {
  push: (path: string) => void
  replace: (path: string) => void
  go: (count: number) => void
  goBack: () => void
  goForward: () => void
}

const initialLocation = normalizeLocation({
  pathname: appIsElectron ? '/app' : browserHistory.location.pathname,
  hash: browserHistory.location.hash,
  query: parseQuery(browserHistory.location.search),
})

function useRouteStore(): RouterStore {
  const [location, setLocation] = useState(initialLocation)

  const push = useCallback((urlStr: string) => {
    browserHistory.push(urlStr)
  }, [])

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
