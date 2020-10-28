import { useMemo } from 'react'
import { useRouter } from './router'

export interface BaseRouteParams {
  name: string
}

export interface StorageCreate extends BaseRouteParams {
  name: 'storages.create'
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

export interface StorageAttachmentsRouteParams extends BaseRouteParams {
  name: 'storages.attachments'
  storageId: string
}

export interface UnknownRouteparams extends BaseRouteParams {
  name: 'unknown'
}

export type AllRouteParams =
  | StorageCreate
  | StorageNotesRouteParams
  | StorageTrashCanRouteParams
  | StorageTagsRouteParams
  | StorageAttachmentsRouteParams
  | UnknownRouteparams

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
