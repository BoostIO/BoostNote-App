import { callApi } from '../../../lib/client'
import { GeneralAppProps } from '../../../interfaces/api'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export type SharedDocsListResponseBody = GeneralAppProps

export async function getSharedDocsListData({
  pathname,
  search,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')
  const data = await callApi<SharedDocsListResponseBody>(
    'api/pages/teams/shared/list',
    {
      search: search + `&teamId=${teamId}`,
    }
  )

  return data
}
