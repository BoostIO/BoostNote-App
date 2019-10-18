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

export interface BaseRouteParams {
  name: string
}

export interface StorageAllNotes extends BaseRouteParams {
  name: 'storages.allNotes'
  storageId: string
  noteId?: string
}

export interface StorageNotesRouteParams extends BaseRouteParams {
  name: 'storages.notes'
  storageId: string
  folderPathname: string
  noteId?: string
}

export interface StorageTrashCanRouteParams extends BaseRouteParams {
  name: 'storages.trashCan'
  storageId: string
  noteId?: string
}

export interface StorageTagsRouteParams extends BaseRouteParams {
  name: 'storages.tags.show'
  storageId: string
  tagName: string
  noteId?: string
}

export interface UnknownRouteparams extends BaseRouteParams {
  name: 'unknown'
}

export type AllRouteParams =
  | StorageAllNotes
  | StorageNotesRouteParams
  | StorageTrashCanRouteParams
  | StorageTagsRouteParams
  | UnknownRouteparams

export const useRouteParams = () => {
  const { pathname } = useRouter()
  return useMemo((): AllRouteParams => {
    const names = pathname
      .slice('/app'.length)
      .split('/')
      .slice(1)

    if (names[0] !== 'storages' || names[1] == null) {
      return {
        name: 'unknown'
      }
    }
    const storageId = names[1]

    if (names[2] === 'notes') {
      const restNames = names.slice(3)
      if (restNames[0] == null || restNames[0] === '') {
        return {
          name: 'storages.notes',
          storageId,
          folderPathname: '/'
        }
      }
      const folderNames = []

      let noteId: string | undefined = undefined
      for (const index in restNames) {
        const name = restNames[index]
        if (/^note:/.test(name)) {
          noteId = name
          break
        } else {
          folderNames.push(name)
        }
      }

      return {
        name: 'storages.notes',
        storageId,
        folderPathname: '/' + folderNames.join('/'),
        noteId
      }
    }

    if (names[2] === 'tags') {
      return {
        name: 'storages.tags.show',
        storageId,
        tagName: names[3],
        noteId: /^notes:/.test(names[4]) ? names[4] : undefined
      }
    }

    return {
      name: 'unknown'
    }
  }, [pathname])
}
