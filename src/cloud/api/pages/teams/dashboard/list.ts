import { GeneralAppProps } from '../../../../interfaces/api'
import { callApi } from '../../../../lib/client'
import { GetInitialPropsParameters } from '../../../../interfaces/pages'
import querystring from 'querystring'
import { SerializedDashboardFolder } from '../../../../interfaces/db/dashboardFolder'

export type DashboardFolderShowPageResponseBody = GeneralAppProps & {
  dashboardFolders: SerializedDashboardFolder[]
}

export async function getDashboardFolderShowPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')

  const data = await callApi<DashboardFolderShowPageResponseBody>(
    'api/pages/teams/dashboard/folders/list',
    {
      search: {
        ...querystring.parse(search),
        teamId,
      },
      signal,
    }
  )

  return data
}
