import { GeneralAppProps } from '../../../../interfaces/api'
import { callApi } from '../../../../lib/client'
import { GetInitialPropsParameters } from '../../../../interfaces/pages'
import querystring from 'querystring'
import { SerializedSmartView } from '../../../../interfaces/db/smartView'

export type SmartViewListPageResponseBody = GeneralAppProps & {
  data: SerializedSmartView[]
}

export async function getSmartViewListPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')

  const data = await callApi<SmartViewListPageResponseBody>(
    'api/pages/teams/smartView/list',
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
