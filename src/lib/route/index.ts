import { Location, createBrowserHistory } from 'history'
import path from 'path'
import pathToRegexp from 'path-to-regexp'
import { createStoreContext } from '../utils/context'
import { useState, useEffect } from 'react'

export const history = createBrowserHistory()

export const storageRegexp = pathToRegexp(
  '/storages/:storageName/:rest*',
  undefined,
  {
    sensitive: true
  }
)

export const folderRegexp = pathToRegexp(
  '/storages/:storageName/notes/:rest*',
  undefined,
  {
    sensitive: true
  }
)

export const tagRegexp = pathToRegexp(
  '/storages/:storageName/tags/:tag',
  undefined,
  {
    sensitive: true
  }
)

function normalizePathname(pathname: string): string {
  const normalizedPathname = path.normalize(pathname)
  const normalizedLength = normalizedPathname.length
  if (normalizedPathname[normalizedLength - 1] === '/') {
    return normalizedPathname.slice(0, normalizedLength - 1)
  }
  return normalizedPathname
}

function normalizeLocation({ pathname, key, ...otherProps }: Location) {
  return {
    pathname: normalizePathname(pathname),
    ...otherProps
  }
}

export interface RouteContext {
  pathname: string
  search: string
  hash: string
  state: any
}

const initialLocation = normalizeLocation(history.location)

function createRouteStore(): RouteContext {
  const [location, setLocation] = useState(initialLocation)

  useEffect(() => {
    const unlisten = history.listen(location => {
      setLocation(normalizeLocation(location))
    })
    return unlisten
  }, [])

  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state
  }
}

export const {
  StoreProvider: RouteProvider,
  useStore: useRoute
} = createStoreContext(createRouteStore)
