import { GeneralAppProps } from '../../../../interfaces/api'
import { callApi } from '../../../../lib/client'
import { GetInitialPropsParameters } from '../../../../interfaces/pages'
import querystring from 'querystring'
import { SerializedDashboard } from '../../../../interfaces/db/dashboard'

export type DashboardListPageResponseBody = GeneralAppProps & {
  data: SerializedDashboard[]
}

export async function getDashboardListPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')

  const data = await callApi<DashboardListPageResponseBody>(
    'api/pages/teams/dashboard/list',
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
