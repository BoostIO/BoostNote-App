import { GeneralAppProps } from '../../../interfaces/api'
import {
  SerializedDocWithSupplemental,
  SerializedDoc,
} from '../../../interfaces/db/doc'
import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../../../interfaces/db/folder'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedUser } from '../../../interfaces/db/user'
import { SerializedRevision } from '../../../interfaces/db/revision'
import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import querystring from 'querystring'
import { prefixDocs, prefixFolders } from '../../../lib/utils/patterns'
import { GetDocResponseBody } from '../../teams/docs'
import { getResourceFromSlug } from '../../mock/db/utils'

export type TeamIndexPageResponseBody = GeneralAppProps & {
  pageWorkspace: SerializedWorkspace
}

export async function getTeamIndexPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')

  return callApi<TeamIndexPageResponseBody>('api/pages/teams', {
    search: {
      ...querystring.parse(search),
      teamId,
    },
    signal,
  })
}

export type DocPageResourceProps = {
  type: 'doc'
  pageDoc: SerializedDocWithSupplemental
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
  revisionHistory: SerializedRevision[]
}

export type FolderPageResourceProps = {
  type: 'folder'
  pageFolder: SerializedFolderWithBookmark
}

export type ResourceSplitProps = DocPageResourceProps | FolderPageResourceProps

export type ResourceShowPageResponseBody = GeneralAppProps &
  ResourceSplitProps & { thread?: string }

export async function getResourceShowPageData({
  pathname,
  signal,
}: GetInitialPropsParameters) {
  const [, _, ...otherPathnames] = pathname.split('/')

  const resourceSlug = otherPathnames.join('/')
  const [type, id] = getResourceFromSlug(resourceSlug)

  if (type === prefixDocs) {
    const [{ doc }, { data: token }] = await Promise.all([
      callApi<GetDocResponseBody>(`api/docs/${id}`, { signal }),
      callApi<{ data: string }>(`api/docs/${id}/token`, { signal }),
    ])

    return {
      type: 'doc',
      docs: [doc],
      pageDoc: { ...doc, collaborationToken: token },
    }
  }

  if (type === prefixFolders) {
    const [{ folder }, { docs }] = await Promise.all([
      callApi<{ folder: SerializedFolder }>(`api/folders/${id}`),
      callApi<{ docs: SerializedDoc[] }>(`/api/docs`, {
        search: { parentFolder: id },
      }),
    ])

    return {
      type: 'folder',
      pageFolder: folder,
      docs,
    }
  }

  const { workspace } = await callApi<{ workspace: SerializedWorkspace }>(
    `api/workspaces/${id}`
  )
  return {
    type: 'workspace',
    pageWorkspace: workspace,
  }
}
