import { createStoreContext } from '../utils/context'
import { normalizeLocation } from './utils'
import { useState, useCallback, useEffect } from 'react'
import { Location } from './types'
import { createBrowserHistory, createHashHistory } from 'history'
import { parse as parseQuery } from 'querystring'
import isElectron from 'is-electron'

const bhistory = isElectron() ? createHashHistory() : createBrowserHistory()

export interface RouterStore extends Location {
  push: (path: string) => void
  replace: (path: string) => void
  go: (count: number) => void
  goBack: () => void
  goForward: () => void
}

const initialLocation = normalizeLocation({
  pathname: isElectron() ? '/app' : bhistory.location.pathname,
  hash: bhistory.location.hash,
  query: parseQuery(bhistory.location.search)
})

function useRouteStore(): RouterStore {
  const [location, setLocation] = useState(initialLocation)

  const push = useCallback((urlStr: string) => {
    bhistory.push(urlStr)
  }, [])

  const replace = useCallback((urlStr: string) => {
    bhistory.replace(urlStr)
  }, [])

  const go = useCallback((count: number) => {
    bhistory.go(count)
  }, [])

  const goBack = useCallback(() => go(-1), [go])
  const goForward = useCallback(() => go(1), [go])

  useEffect(() => {
    return bhistory.listen(blocation => {
      setLocation({
        pathname: blocation.pathname,
        hash: blocation.hash,
        query: parseQuery(blocation.search)
      })
    })
  }, [])

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
