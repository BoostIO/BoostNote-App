import { CallCloudJsonApiParameter } from '../../lib/client'
import { match } from 'path-to-regexp'
import { getMockTeamByDomain } from './db/teams'
import { init } from './db/init'
import { getMockPermissionsListByTeamId } from './db/permissions'
import { getMockWorkspacesByTeamId } from './db/workspaces'
import querystring from 'querystring'
import { GetResourcesResponseBody } from '../teams/resources'
import { GetTemplatesResponseBody } from '../teams/docs/templates'
import { GetEditRequestsResponseBody } from '../editRequests'
import { GetOpenInviteResponseBody } from '../teams/open-invites'
import { getMockTeamFolders } from './db/folders'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'

interface MockRouteHandlerParams {
  params: { [key: string]: any }
  search: { [key: string]: string | number | boolean }
}

interface MockRoute {
  pathname: string
  handler: (params: MockRouteHandlerParams) => any
}

const { user, team } = init()

const routes: MockRoute[] = [
  {
    pathname: 'api/global',
    handler: () => {
      return {
        currentUser: user,
        currentUserSettings: {},
        currentUserOnboarding: {},
        teams: [team],
        invites: [],
        realtimeAuth: 'mock',
      }
    },
  },
  {
    pathname: 'api/pages/teams/show',
    handler: ({ search }) => {
      const { teamId: domain } = search
      if (typeof domain !== 'string') {
        throw new Error(`Invalid domain (Domain: ${domain})`)
      }
      const team = getMockTeamByDomain(domain)
      if (team == null) {
        throw new Error(`Team does not exist (Domain: ${domain})`)
      }

      const workspaces = getMockWorkspacesByTeamId(team.id)
      const defaultWorkspace = workspaces.find((workspace) => workspace.default)
      return {
        team,
        folders: [],
        docs: [],
        permissions: getMockPermissionsListByTeamId(team.id),
        workspaces: workspaces,
        tags: [],
        pageWorkspace: defaultWorkspace,
      }
    },
  },
  {
    pathname: 'api/teams/:teamId/resources',
    handler: ({ params }): GetResourcesResponseBody => {
      const { teamId } = params
      const workspaces = getMockWorkspacesByTeamId(teamId)
      const folders = getMockTeamFolders(teamId)

      return {
        workspaces: workspaces,
        folders: folders.map((mockFolder) => {
          return {
            ...mockFolder,
            pathname: '',
            positions: { id: 'mock', orderedIds: [], updatedAt: '' },
            childDocs: [],
            childFolders: [],
            childDocsIds: [],
            childFoldersIds: [],
            bookmarked: false,
          } as SerializedFolderWithBookmark
        }),
        docs: [],
        tags: [],
        smartFolders: [],
        appEvents: [],
      }
    },
  },
  {
    pathname: 'api/templates',
    handler: ({ search }): GetTemplatesResponseBody => {
      const { teamId: _teamId } = search
      return {
        templates: [],
      }
    },
  },
  {
    pathname: 'api/edit-requests',
    handler: ({ search }): GetEditRequestsResponseBody => {
      const { teamId: _teamId } = search
      return {
        editRequests: [],
      }
    },
  },
  {
    pathname: 'api/teams/:teamId/open-invites',
    handler: ({ params }): GetOpenInviteResponseBody => {
      const { teamId: _teamId } = params
      return {
        invites: [],
      }
    },
  },
]

export async function mockHandler(
  pathname: string,
  apiParams: CallCloudJsonApiParameter
) {
  for (const route of routes) {
    const matcher = match(route.pathname)
    const result = matcher(pathname)

    if (!result) {
      continue
    }
    return route.handler({
      params: result.params,
      search: parseQuery(apiParams.search),
    })
  }

  throw new Error(`Not found(Mock: /${pathname})`)
}

function parseQuery(
  search:
    | string
    | { [key: string]: string | number | boolean }
    | URLSearchParams = {}
): { [key: string]: string | number | boolean } {
  if (search instanceof URLSearchParams) {
    search = search.toString()
  }
  if (typeof search === 'string') {
    if (/^\?/.test(search)) {
      search = search.slice(1)
    }
    return querystring.parse(search) as {
      [key: string]: string | number | boolean
    }
  }

  return search
}
