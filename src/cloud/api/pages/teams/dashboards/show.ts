import { GeneralAppProps } from '../../../../interfaces/api'
import { callApi } from '../../../../lib/client'
import { GetInitialPropsParameters } from '../../../../interfaces/pages'
import querystring from 'querystring'
import { SerializedDashboard } from '../../../../interfaces/db/dashboard'
import { SerializedSmartView } from '../../../../interfaces/db/smartView'
import { SerializedView } from '../../../../interfaces/db/view'

export type DashboardShowPageResponseBody = GeneralAppProps & {
  dashboard: SerializedDashboard
  smartViews: (SerializedSmartView & { views: SerializedView[] })[]
}

export async function getDashboardShowPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId, , dashboardId] = pathname.split('/')

  const data = await callApi<DashboardShowPageResponseBody>(
    'api/pages/teams/dashboard/show',
    {
      search: {
        ...querystring.parse(search),
        teamId,
        dashboardId,
      },
      signal,
    }
  )

  return data
}
