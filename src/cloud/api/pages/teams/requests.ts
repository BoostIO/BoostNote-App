import { callApi } from '../../../lib/client'
import { GeneralAppProps } from '../../../interfaces/api'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export type RequestDeniedResponseBody = GeneralAppProps

export async function getRequestDeniedPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')

  const data = await callApi<RequestDeniedResponseBody>(
    'api/pages/teams/requests/deny',
    {
      search: search + `&teamId=${teamId}`,
      signal,
    }
  )

  return data
}
