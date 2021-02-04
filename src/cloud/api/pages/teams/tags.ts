import { GeneralAppProps } from '../../../interfaces/api'
import { SerializedTag } from '../../../interfaces/db/tag'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { callApi } from '../../../lib/client'

export type TagsShowPageResponseBody = GeneralAppProps & {
  pageTag: SerializedTag
}

export async function getTagsShowPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')
  const data = await callApi<TagsShowPageResponseBody>(
    'api/pages/teams/labels/show',
    {
      search: search + `&teamId=${teamId}`,
      signal,
    }
  )

  return data
}
