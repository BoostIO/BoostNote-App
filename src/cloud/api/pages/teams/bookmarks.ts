import { callApi } from '../../../lib/client'
import { GeneralAppProps } from '../../../interfaces/api'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export type BookmarksListPageResponseBody = GeneralAppProps

export async function getBookmarksListPageData({
  search,
  signal,
}: GetInitialPropsParameters) {
  const data = await callApi<BookmarksListPageResponseBody>(
    'api/pages/teams/bookmarks/list',
    {
      search,
      signal,
    }
  )

  return data
}
