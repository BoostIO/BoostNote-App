import { useMemo, useRef } from 'react'
import { UrlObject, parse as parseUrl } from 'url'
import { createStoreContext } from '../../lib/context'
import { useState, useCallback, useEffect } from 'react'
import { normalizeLocation } from '../../lib/url'
import { createBrowserHistory, LocationDescriptorObject } from 'history'
import { parse as parseQuery } from 'querystring'

const browserHistory = createBrowserHistory<unknown>({
  forceRefresh: false,
})

export type Url = UrlObject | string

const initialLocation = normalizeLocation({
  pathname: browserHistory.location.pathname,
  hash: browserHistory.location.hash,
  search: browserHistory.location.search,
})

function useRouterStore() {
  const [location, setLocation] = useState<{
    state?: any
    hash: string
    search: string
    pathname: string
  }>({
    ...initialLocation,
    state: {},
  })

  const query = useMemo(() => {
    return parseQuery(location.search.slice(1))
  }, [location.search])

  const push = useCallback((url: Url, state: any = {}) => {
    const parsedUrl = typeof url === 'string' ? parseUrl(url) : url

    browserHistory.push({
      pathname: parsedUrl.pathname,
      search: parsedUrl.search,
      hash: parsedUrl.hash,
      state: state,
    } as LocationDescriptorObject)
  }, [])

  const replace = useCallback((urlStr: string) => {
    browserHistory.replace(urlStr)
  }, [])

  const go = useCallback((count: number) => {
    browserHistory.go(count)
  }, [])

  const goBack = useCallback(() => browserHistory.goBack(), [])
  const goForward = useCallback(() => browserHistory.goForward(), [])

  useEffect(() => {
    return browserHistory.listen((blocation) => {
      setLocation({
        pathname: blocation.pathname,
        hash: blocation.hash,
        search: blocation.search,
        state: blocation.state,
      })
    })
  }, [])

  const router = useMemo(() => {
    return {
      ...location,
      query,
      push,
      replace,
      go,
      goBack,
      goForward,
    }
  }, [location, query, push, replace, go, goBack, goForward])

  return router
}

export const {
  useStore: useRouter,
  StoreProvider: RouterProvider,
} = createStoreContext(useRouterStore)

export function usePathnameChangeEffect(
  callback: (() => () => void) | (() => void)
) {
  const { pathname } = useRouter()
  const previousPathnameRef = useRef(pathname)
  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return
    }
    previousPathnameRef.current = pathname
    return callback()
  }, [pathname, callback])
}
