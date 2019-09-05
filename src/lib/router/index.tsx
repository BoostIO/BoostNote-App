import {
  Location,
  createBrowserHistory,
  LocationDescriptorObject
} from 'history'
import path from 'path'
import pathToRegexp from 'path-to-regexp'
import { createStoreContext } from '../utils/context'
import React, { useState, useEffect, useCallback, FC } from 'react'

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

export interface RouterStore {
  pathname: string
  search: string
  hash: string
  push: (path: string | LocationDescriptorObject<any>) => void
  replace: (path: string | LocationDescriptorObject<any>) => void
  go: (count: number) => void
  goBack: () => void
  goForward: () => void
}

const initialLocation = normalizeLocation(history.location)

function createRouteStore(): RouterStore {
  const [location, setLocation] = useState(initialLocation)

  useEffect(() => {
    const unlisten = history.listen(location => {
      setLocation(normalizeLocation(location))
    })
    return unlisten
  }, [])

  const push = useCallback(history.push, [])
  const replace = useCallback(
    (path: string | LocationDescriptorObject<any>) => {
      history.replace(path as string)
    },
    []
  )
  const go = useCallback((count: number) => {
    history.go(count)
  }, [])
  const goBack = useCallback(() => go(-1), [])
  const goForward = useCallback(() => go(1), [])

  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
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
} = createStoreContext(createRouteStore)

export interface LinkProps {
  href: string
  children: React.ReactChildren
}

export const Link: FC<LinkProps> = ({ children, href }) => {
  const router = useRouter()

  const push = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      router.push(href)
    },
    [href, router]
  )

  return (
    <a onClick={push} href={href}>
      {children}
    </a>
  )
}
