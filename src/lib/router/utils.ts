import { useMemo } from 'react'
import path from 'path'
import pathToRegexp from 'path-to-regexp'
import { Location } from './types'
import { parse as _parseUrl } from 'url'
import { useRouter } from './store'

export function normalizePathname(pathname: string): string {
  const normalizedPathname = path.normalize(pathname)
  const normalizedLength = normalizedPathname.length
  if (normalizedPathname[normalizedLength - 1] === '/') {
    return normalizedPathname.slice(0, normalizedLength - 1)
  }
  return normalizedPathname
}

export function normalizeLocation({ pathname, ...otherProps }: Location) {
  return {
    pathname: normalizePathname(pathname),
    ...otherProps
  }
}

export const tagRegexp = pathToRegexp(
  '/app/storages/:storageName/tags/:tag',
  undefined,
  {
    sensitive: true
  }
)

export function parseUrl(urlStr: string): Location {
  const url = _parseUrl(urlStr, true)
  return {
    pathname: url.pathname || '',
    hash: url.hash || '',
    query: url.query
  }
}

export const useNotesPathname = () => {
  const { pathname } = useRouter()
  return useMemo((): [null | string, null | string, null | string] => {
    const names = pathname.slice(1).split('/').slice(1)
    if (names[0] !== 'storages' || names[1] == null) {
      return [null, null, null]
    }
    const storageId = names[1]

    if (names[2] !== 'notes') {
      return [storageId, null, null]
    }

    const restNames = names.slice(3)
    if (restNames[0] == null || restNames[0] === '') {
      return [storageId, '/', null]
    }

    const folderNames = []
    let noteId: string | null = null
    for (const index in restNames) {
      const name = restNames[index]
      if (/^note:/.test(name)) {
        noteId = name
        break
      } else {
        folderNames.push(name)
      }
    }

    return [storageId, '/' + folderNames.join('/'), noteId]
  }, [pathname])
}
