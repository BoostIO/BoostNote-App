import { CallCloudJsonApiParameter } from '../../lib/client'
import { match } from 'path-to-regexp'
import { getMockTeamByDomain } from './db/mockEntities/teams'
import {
  getMockPermissionsListByTeamId,
  getMockPermissionsListByUserId,
} from './db/mockEntities/permissions'
import { getMockWorkspacesByTeamId } from './db/mockEntities/workspaces'
import querystring from 'querystring'
import { GetResourcesResponseBody } from '../teams/resources'
import { GetTemplatesResponseBody } from '../teams/docs/templates'
import { GetEditRequestsResponseBody } from '../editRequests'
import { GetOpenInviteResponseBody } from '../teams/open-invites'
import {
  getMockFolderById,
  getMockTeamFolders,
} from './db/mockEntities/folders'
import { populateDoc, populateFolder, populatePermissions } from './db/populate'
import {
  DocPageResourceProps,
  FolderPageResourceProps,
  ResourceShowPageResponseBody,
  TeamShowPageResponseBody,
} from '../pages/teams'
import { getResourceFromSlug } from './db/utils'
import { getMockDocById } from './db/mockEntities/docs'
import { GlobalDataResponseBody } from '../global'
import { getDefaultMockUserId } from './db/init'
import { getMockUserById } from './db/mockEntities/users'

interface MockRouteHandlerParams {
  params: { [key: string]: any }
  search: { [key: string]: string | number | boolean }
}

interface MockRoute {
  pathname: string
  handler: (params: MockRouteHandlerParams) => any
}

const routes: MockRoute[] = [
  {
    pathname: 'api/global',
    handler: (): GlobalDataResponseBody => {
      const defaultUserId = getDefaultMockUserId()
      const defaultUser = getMockUserById(defaultUserId || '')
      if (defaultUser == null) {
        return {
          teams: [],
          invites: [],
        }
      }
      const defaultUserPermissions = getMockPermissionsListByUserId(
        defaultUser.id
      ).map(populatePermissions)

      const teams = defaultUserPermissions.map((permission) => permission.team)

      return {
        currentUser: {
          ...defaultUser,
          permissions: defaultUserPermissions,
        },
        currentUserOnboarding: {},
        teams: teams.map((team) => {
          return {
            ...team,
            permissions: getMockPermissionsListByTeamId(team.id).map(
              populatePermissions
            ),
          }
        }),
        invites: [],
        realtimeAuth: 'mock',
      }
    },
  },
  {
    pathname: 'api/pages/teams/show',
    handler: ({ search }): TeamShowPageResponseBody => {
      const { teamId: domain } = search
      if (typeof domain !== 'string') {
        throw new Error(`Invalid domain (Domain: ${domain})`)
      }
      const team = getMockTeamByDomain(domain)
      if (team == null) {
        throw new Error(`Team does not exist (Domain: ${domain})`)
      }

      const workspaces = getMockWorkspacesByTeamId(team.id)
      const defaultWorkspace = workspaces.find(
        (workspace) => workspace.default
      )!
      return {
        team,
        folders: [],
        docs: [],
        permissions: getMockPermissionsListByTeamId(team.id).map(
          populatePermissions
        ),
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
        folders: folders.map(populateFolder),
        docs: [],
        tags: [],
        smartFolders: [],
        appEvents: [],
      }
    },
  },
  {
    pathname: 'api/pages/teams/resources/show',
    handler: ({ search }): ResourceShowPageResponseBody => {
      const { teamId, resourceId: resourceSlug } = search
      const team = getMockTeamByDomain(teamId as string)
      if (team == null) {
        throw new Error(`The team does not exist. (teamId: ${teamId})`)
      }

      const globalProps = {
        team,
        folders: [],
        docs: [],
        permissions: getMockPermissionsListByTeamId(teamId as string).map(
          populatePermissions
        ),
        workspaces: [],
        tags: [],
      }

      const [type, resourceId] = getResourceFromSlug(resourceSlug as string)

      if (type === 'fD') {
        const folder = getMockFolderById(resourceId)
        if (folder == null) {
          throw new Error(`The folder does not exist (folderId: ${resourceId})`)
        }
        const folderPageResourceProps: FolderPageResourceProps = {
          type: 'folder',
          pageFolder: populateFolder(folder),
        }
        return {
          ...globalProps,
          ...folderPageResourceProps,
        }
      } else {
        const doc = getMockDocById(resourceId)
        if (doc == null) {
          throw new Error(`The doc does not exist (docId: ${resourceId})`)
        }
        const docPageResourceProps: DocPageResourceProps = {
          type: 'doc',
          pageDoc: populateDoc(doc),
          contributors: [],
          backLinks: [],
          revisionHistory: [],
        }
        return {
          ...globalProps,
          ...docPageResourceProps,
        }
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
