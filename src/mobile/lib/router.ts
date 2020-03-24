import { createStoreContext } from '../../lib/context'
import { normalizeLocation } from '../../lib/router/utils'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { Location, AllRouteParams } from '../../lib/router/types'
import { createHashHistory } from 'history'
import { parse as parseQuery } from 'querystring'
export * from '../../lib/router/types'

const bhistory = createHashHistory()

export interface RouterStore extends Location {
  push: (path: string) => void
  replace: (path: string) => void
  go: (count: number) => void
  goBack: () => void
  goForward: () => void
}

const initialLocation = normalizeLocation({
  pathname: bhistory.location.pathname,
  hash: bhistory.location.hash,
  query: parseQuery(bhistory.location.search),
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
    return bhistory.listen((blocation) => {
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

export const useRouteParams = () => {
  const { pathname } = useRouter()
  return useMemo((): AllRouteParams => {
    const names = pathname.slice('/m'.length).split('/').slice(1)

    let noteId: string | undefined = undefined
    if (names[0] === 'notes') {
      if (/^note:/.test(names[1])) {
        noteId = names[1]
      }

      return {
        name: 'storages.allNotes',
        noteId,
      }
    }

    if (names[0] === 'bookmarks') {
      return {
        name: 'storages.bookmarks',
      }
    }

    if (names[0] === 'storages' && names[1] == null) {
      return {
        name: 'storages.create',
      }
    }

    if (names[0] === 'tutorials') {
      return {
        name: 'tutorials.show',
        path: pathname,
      }
    }

    if (names[0] !== 'storages' || names[1] == null) {
      return {
        name: 'unknown',
      }
    }
    const storageId = names[1]

    if (names[2] == null) {
      return {
        name: 'storages.edit',
        storageId,
      }
    }

    if (names[2] === 'notes') {
      const restNames = names.slice(3)
      if (restNames[0] == null || restNames[0] === '') {
        return {
          name: 'storages.allNotes',
          storageId,
        }
      }

      const folderNames = []
      for (const index in restNames) {
        const name = restNames[index]
        if (/^note:/.test(name)) {
          noteId = name
          break
        } else {
          folderNames.push(name)
        }
      }

      if (restNames[0].match(new RegExp(`(^note\:[A-z0-9]*)`, 'g'))) {
        return {
          name: 'storages.allNotes',
          storageId,
          noteId,
        }
      }

      return {
        name: 'storages.notes',
        storageId,
        folderPathname: '/' + folderNames.join('/'),
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
      case 'storages.allNotes':
        if (routeParams.storageId == null) {
          return `/m/notes`
        }
        return `/m/storages/${routeParams.storageId}/notes`
      case 'storages.notes':
        return `/m/storages/${routeParams.storageId}/notes${
          routeParams.folderPathname === '/' ? '' : routeParams.folderPathname
        }`
      case 'storages.tags.show':
        return `/m/storages/${routeParams.storageId}/tags/${routeParams.tagName}`
      case 'storages.trashCan':
        return `/m/storages/${routeParams.storageId}/trashcan`
    }
    return pathname
  }, [routeParams, pathname])
}
