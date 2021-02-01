import { GeneralAppProps } from '../../../interfaces/api'
import {
  SerializedDocWithBookmark,
  SerializedDoc,
} from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedOpenInvite } from '../../../interfaces/db/openInvite'
import { SerializedUser } from '../../../interfaces/db/user'
import { SerializedRevision } from '../../../interfaces/db/revision'
import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import querystring from 'querystring'

export type TeamShowPageResponseBody = GeneralAppProps & {
  pageWorkspace: SerializedWorkspace
  openInvite?: SerializedOpenInvite
}

export async function getTeamIndexPageData({
  pathname,
  search,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')
  const data = await callApi<TeamShowPageResponseBody>('api/pages/teams/show', {
    search: search + `&teamId=${teamId}`,
  })

  return data
}

export type DocPageResourceProps = {
  type: 'doc'
  pageDoc: SerializedDocWithBookmark
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
  revisionHistory: SerializedRevision[]
}

export type FolderPageResourceProps = {
  type: 'folder'
  pageFolder: SerializedFolderWithBookmark
}

export type ResourceSplitProps = DocPageResourceProps | FolderPageResourceProps

export type ResourceShowPageResponseBody = GeneralAppProps & ResourceSplitProps

export async function getResourceShowPageData({
  pathname,
  search,
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
    }
  )

  return data
}
