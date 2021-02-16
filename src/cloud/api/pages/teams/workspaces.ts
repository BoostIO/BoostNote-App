import { callApi } from '../../../lib/client'
import { GeneralAppProps } from '../../../interfaces/api'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import querystring from 'querystring'

export type WorkspacesShowPageResponseBody = GeneralAppProps & {
  pageWorkspace: SerializedWorkspace
}

export async function getWorkspaceShowPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId, ...otherPathnames] = pathname.split('/')
  const workspaceId = otherPathnames.join('/')

  return callApi<WorkspacesShowPageResponseBody>(
    'api/pages/teams/workspaces/show',
    {
      search: {
        ...querystring.parse(search),
        teamId,
        workspaceId,
      },
      signal,
    }
  )
}
