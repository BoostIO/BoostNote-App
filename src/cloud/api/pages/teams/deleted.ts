import { GeneralAppProps } from '../../../interfaces/api'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { callApi } from '../../../lib/client'

export type ArchivedDocsListResponseBody = GeneralAppProps

export async function getArchivedDocsListPageData({
  pathname,
  search,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')
  const data = await callApi<ArchivedDocsListResponseBody>(
    'api/pages/teams/archived/list',
    {
      search: search + `&teamId=${teamId}`,
    }
  )

  return data
}
