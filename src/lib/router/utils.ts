import { useMemo } from 'react'
import path from 'path'
import pathToRegexp from 'path-to-regexp'
import { Location, AllRouteParams } from './types'
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
    ...otherProps,
  }
}

export const tagRegexp = pathToRegexp(
  '/app/storages/:storageName/tags/:tag',
  undefined,
  {
    sensitive: true,
  }
)

export function parseUrl(urlStr: string): Location {
  const url = _parseUrl(urlStr, true)
  return {
    pathname: url.pathname || '',
    hash: url.hash || '',
    query: url.query,
  }
}

export const useRouteParams = () => {
  const { pathname } = useRouter()
  return useMemo((): AllRouteParams => {
    const names = pathname.slice('/app'.length).split('/').slice(1)

    if (names[0] === 'storages' && names[1] == null) {
      return {
        name: 'storages.create',
      }
    }

    if (names[0] !== 'storages' || names[1] == null) {
      return {
        name: 'unknown',
      }
    }
    const storageId = names[1]
    if (names[2] == null || names[2].length === 0) {
      return {
        name: 'storages.notes',
        storageId,
        folderPathname: '/',
      }
    }

    if (names[2] === 'settings') {
      return {
        name: 'storages.settings',
        storageId,
      }
    }

    let noteId: string | undefined = undefined
    if (names[2] === 'notes') {
      const restNames = names.slice(3)
      if (restNames[0] == null || restNames[0] === '') {
        return {
          name: 'storages.notes',
          storageId,
          folderPathname: '/',
        }
      }

      const folderNames = []
      for (const index in restNames) {
        const name = restNames[index]
        if (name === '') {
          break
        }

        if (/^note:/.test(name)) {
          noteId = name
          break
        }

        folderNames.push(name)
      }

      return {
        name: 'storages.notes',
        storageId,
        folderPathname:
          folderNames.length === 0 ? '/' : '/' + folderNames.join('/'),
        noteId,
      }
    }

    if (names[2] === 'tags') {
      return {
        name: 'storages.tags.show',
        storageId,
        tagName: names[3],
        noteId: /^note:/.test(names[4]) ? names[4] : undefined,
      }
    }

    if (names[2] === 'trashcan') {
      return {
        name: 'storages.trashCan',
        storageId,
        noteId: /^note:/.test(names[3]) ? names[3] : undefined,
      }
    }

    if (names[2] === 'attachments') {
      return {
        name: 'storages.attachments',
        storageId,
      }
    }

    return {
      name: 'unknown',
    }
  }, [pathname])
}

export const usePathnameWithoutNoteId = () => {
  const { pathname } = useRouter()
  const routeParams = useRouteParams()
  return useMemo(() => {
    switch (routeParams.name) {
      case 'storages.notes':
        return `/app/storages/${routeParams.storageId}/notes${
          routeParams.folderPathname === '/' ? '' : routeParams.folderPathname
        }`
      case 'storages.tags.show':
        return `/app/storages/${routeParams.storageId}/tags/${routeParams.tagName}`
      case 'storages.trashCan':
        return `/app/storages/${routeParams.storageId}/trashcan`
    }
    return pathname
  }, [routeParams, pathname])
}

export const useActiveStorageId = () => {
  const routeParams = useRouteParams()
  return useMemo(() => {
    switch (routeParams.name) {
      default:
        return routeParams.storageId
      case 'storages.create':
      case 'unknown':
        return null
    }
  }, [routeParams])
}
