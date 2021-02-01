import { callApi } from '../../../lib/client'
import { GeneralAppProps } from '../../../interfaces/api'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export type SharedDocsListResponseBody = GeneralAppProps

export async function getSharedDocsListData({
  search,
}: GetInitialPropsParameters) {
  const data = await callApi<SharedDocsListResponseBody>(
    'api/pages/teams/shared/list',
    {
      search,
    }
  )

  return data
}
