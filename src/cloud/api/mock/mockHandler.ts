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
import {
  populateDoc,
  populateFolder,
  populatePermissions,
  populateWorkspace,
} from './db/populate'
import {
  DocPageResourceProps,
  FolderPageResourceProps,
  ResourceShowPageResponseBody,
  TeamIndexPageResponseBody,
} from '../pages/teams'
import { getResourceFromSlug } from './db/utils'
import {
  createMockDoc,
  getMockDocById,
  getTeamMockDocs,
} from './db/mockEntities/docs'
import { GlobalDataResponseBody } from '../global'
import { getDefaultMockUser, getGeneralAppProps } from './db/init'
import { CreateDocRequestBody, CreateDocResponseBody } from '../teams/docs'

interface MockRouteHandlerParams {
  params: { [key: string]: any }
  search: { [key: string]: string | number | boolean }
  body: { [key: string]: any }
}

interface MockRoute {
  method?: string
  pathname: string
  handler: (params: MockRouteHandlerParams) => any
}

const routes: MockRoute[] = [
  {
    pathname: 'api/global',
    handler: (): GlobalDataResponseBody => {
      const defaultUser = getDefaultMockUser()
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
    handler: ({ search }): TeamIndexPageResponseBody => {
      const { teamId: domain } = search
      if (typeof domain !== 'string') {
        throw new Error(`Invalid domain (Domain: ${domain})`)
      }
      const team = getMockTeamByDomain(domain)
      if (team == null) {
        throw new Error(`Team does not exist (Domain: ${domain})`)
      }

      const generalAppProps = getGeneralAppProps(domain)

      const workspaces = getMockWorkspacesByTeamId(team.id)
      const defaultWorkspace = workspaces.find(
        (workspace) => workspace.default
      )!
      return {
        ...generalAppProps,
        pageWorkspace: defaultWorkspace,
      }
    },
  },
  {
    pathname: 'api/teams/:teamId/resources',
    handler: ({ params }): GetResourcesResponseBody => {
      const { teamId } = params
      const workspaces = getMockWorkspacesByTeamId(teamId).map(
        populateWorkspace
      )
      const folders = getMockTeamFolders(teamId)
      const docs = getTeamMockDocs(teamId).map(populateDoc)

      return {
        workspaces: workspaces,
        folders: folders.map(populateFolder),
        docs: docs,
        tags: [],
        smartViews: [],
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

      const globalProps = getGeneralAppProps(teamId as string)

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
  {
    method: 'post',
    pathname: 'api/teams/:teamId/docs',
    handler: ({ params, body }): CreateDocResponseBody => {
      const defaultUser = getDefaultMockUser()
      if (defaultUser == null) {
        throw new Error('Need default user to create a mock doc')
      }
      const { teamId } = params
      const {
        workspaceId,
        parentFolderId,
        title,
        emoji,
      } = body as CreateDocRequestBody

      const doc = createMockDoc({
        title: title || '',
        emoji,
        parentFolderId,
        generated: false,
        teamId,
        workspaceId: workspaceId!,
        userId: defaultUser.id,
      })

      return { doc: populateDoc(doc) }
    },
  },
]

export async function mockHandler(
  pathname: string,
  apiParams: CallCloudJsonApiParameter
) {
  const method = (apiParams.method || 'get').toLowerCase()
  for (const route of routes) {
    const routeMethod = (route.method || 'get').toLowerCase()
    if (method !== routeMethod) {
      continue
    }
    const matcher = match(route.pathname)
    const result = matcher(pathname)

    if (!result) {
      continue
    }
    return route.handler({
      params: result.params,
      search: parseQuery(apiParams.search),
      body: apiParams.json,
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
