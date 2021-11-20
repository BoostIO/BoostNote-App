import { GeneralAppProps } from '../../../interfaces/api'
import {
  SerializedDocWithSupplemental,
  SerializedDoc,
} from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedUser } from '../../../interfaces/db/user'
import { SerializedRevision } from '../../../interfaces/db/revision'
import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import querystring from 'querystring'

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
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId, ...otherPathnames] = pathname.split('/')

  const resourceId = otherPathnames.join('/')

  const data = await callApi<ResourceShowPageResponseBody>(
    'api/pages/teams/resources/show',
    {
      search: {
        ...querystring.parse(search),
        teamId,
        resourceId,
      },
      signal,
    }
  )

  return data
}
