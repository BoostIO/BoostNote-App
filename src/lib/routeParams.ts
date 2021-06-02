import { useMemo } from 'react'
import { useRouter } from './router'

export interface BaseRouteParams {
  name: string
}

export interface StorageCreate extends BaseRouteParams {
  name: 'workspaces.create'
}

export interface StorageNotesRouteParams extends BaseRouteParams {
  name: 'workspaces.notes'
  workspaceId: string
  folderPathname: string
  noteId?: string
}

export interface StorageTrashCanRouteParams extends BaseRouteParams {
  name: 'workspaces.archive'
  workspaceId: string
  noteId?: string
}

export interface StorageTagsRouteParams extends BaseRouteParams {
  name: 'workspaces.labels.show'
  workspaceId: string
  tagName: string
  noteId?: string
}

export interface StorageAttachmentsRouteParams extends BaseRouteParams {
  name: 'workspaces.attachments'
  workspaceId: string
}

export interface StorageTimelineRouteParams extends BaseRouteParams {
  name: 'workspaces.timeline'
  workspaceId: string
}

export interface BoostHubLoginRouteParams extends BaseRouteParams {
  name: 'boosthub.login'
}

export interface BoostHubTeamsShowRouteParams extends BaseRouteParams {
  name: 'boosthub.teams.show'
  domain: string
}

export interface BoostHubTeamsCreateRouteParams extends BaseRouteParams {
  name: 'boosthub.teams.create'
}

export interface BoostHubAccountDeleteRouteParams extends BaseRouteParams {
  name: 'boosthub.account.delete'
}

export interface UnknownRouteParams extends BaseRouteParams {
  name: 'unknown'
}

export type AllRouteParams =
  | StorageCreate
  | StorageNotesRouteParams
  | StorageTrashCanRouteParams
  | StorageTagsRouteParams
  | StorageAttachmentsRouteParams
  | StorageTimelineRouteParams
  | UnknownRouteParams
  | BoostHubTeamsShowRouteParams
  | BoostHubTeamsCreateRouteParams
  | BoostHubAccountDeleteRouteParams
  | BoostHubLoginRouteParams

export const useRouteParams = () => {
  const { pathname } = useRouter()
  return useMemo((): AllRouteParams => {
    const names = pathname.slice('/app'.length).split('/').slice(1)

    if (names[0] === 'boosthub') {
      switch (names[1]) {
        case 'login':
          return {
            name: 'boosthub.login',
          }
        case 'account':
          if (names[2] === 'delete') {
            return {
              name: 'boosthub.account.delete',
            }
          }
          break
        default:
        case 'teams':
          const domain = names[2]
          if (domain != null) {
            return {
              name: 'boosthub.teams.show',
              domain: domain,
            }
          } else {
            return {
              name: 'boosthub.teams.create',
            }
          }
      }
    }

    if (names[0] === 'storages' && names[1] == null) {
      return {
        name: 'workspaces.create',
      }
    }

    if (names[0] !== 'storages' || names[1] == null) {
      return {
        name: 'unknown',
      }
    }
    const workspaceId = names[1]
    if (names[2] == null || names[2].length === 0) {
      return {
        name: 'workspaces.notes',
        workspaceId,
        folderPathname: '/',
      }
    }

    let noteId: string | undefined = undefined
    if (names[2] === 'notes') {
      const restNames = names.slice(3)
      if (restNames[0] == null || restNames[0] === '') {
        return {
          name: 'workspaces.notes',
          workspaceId,
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
        name: 'workspaces.notes',
        workspaceId,
        folderPathname:
          folderNames.length === 0 ? '/' : '/' + folderNames.join('/'),
        noteId,
      }
    }

    if (names[2] === 'tags') {
      return {
        name: 'workspaces.labels.show',
        workspaceId,
        tagName: names[3],
        noteId: /^note:/.test(names[4]) ? names[4] : undefined,
      }
    }

    if (names[2] === 'archive') {
      return {
        name: 'workspaces.archive',
        workspaceId,
        noteId: /^note:/.test(names[3]) ? names[3] : undefined,
      }
    }

    if (names[2] === 'attachments') {
      return {
        name: 'workspaces.attachments',
        workspaceId,
      }
    }

    if (names[2] === 'timeline') {
      return {
        name: 'workspaces.timeline',
        workspaceId,
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
      case 'workspaces.notes':
        return `/app/storages/${routeParams.workspaceId}/notes${
          routeParams.folderPathname === '/' ? '' : routeParams.folderPathname
        }`
      case 'workspaces.labels.show':
        return `/app/storages/${routeParams.workspaceId}/tags/${routeParams.tagName}`
      case 'workspaces.archive':
        return `/app/storages/${routeParams.workspaceId}/archive`
    }
    return pathname
  }, [routeParams, pathname])
}

export const useActiveStorageId = () => {
  const routeParams = useRouteParams()
  return useMemo(() => {
    switch (routeParams.name) {
      default:
        return routeParams.workspaceId
      case 'boosthub.account.delete':
      case 'boosthub.teams.create':
      case 'boosthub.teams.show':
      case 'boosthub.login':
      case 'workspaces.create':
      case 'unknown':
        return null
    }
  }, [routeParams])
}
