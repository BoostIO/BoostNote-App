import { callApi } from '../../../lib/client'
import { GeneralAppProps } from '../../../interfaces/api'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export type WorkspacesShowPageResponseBody = GeneralAppProps & {
  pageWorkspace: SerializedWorkspace
}

export async function getWorkspaceShowPageData({
  pathname,
  search,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')
  const data = await callApi<WorkspacesShowPageResponseBody>(
    'api/pages/teams/workspaces/show',
    {
      search: search + `&teamId=${teamId}`,
    }
  )

  return data
}
