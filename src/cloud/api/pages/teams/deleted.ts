import { GeneralAppProps } from '../../../interfaces/api'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { callApi } from '../../../lib/client'

export type ArchivedDocsListResponseBody = GeneralAppProps

export async function getArchivedDocsListPageData({
  search,
}: GetInitialPropsParameters) {
  const data = await callApi<ArchivedDocsListResponseBody>(
    'api/pages/teams/archived/list',
    {
      search,
    }
  )

  return data
}
