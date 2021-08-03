import { useMemo } from 'react'
import { useRouter } from './router'

export interface BaseRouteParams {
  name: string
}

export interface LocalSpaceRouteParams extends BaseRouteParams {
  name: 'local'
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
  | LocalSpaceRouteParams
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

    if (names[0] !== 'storages' || names[1] == null) {
      return {
        name: 'unknown',
      }
    }
    const workspaceId = names[1]
    return {
      name: 'local',
      workspaceId,
    }
  }, [pathname])
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
      case 'unknown':
        return null
    }
  }, [routeParams])
}
