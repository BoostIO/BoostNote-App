import { GeneralAppProps } from '../../../interfaces/api'
import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import querystring from 'querystring'
import { SerializedSmartFolder } from '../../../interfaces/db/smartFolder'

export type SmartFolderShowPageResponseBody = GeneralAppProps & {
  smartFolder: SerializedSmartFolder
}

export async function getSmartFolderShowPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId, , smartFolderId] = pathname.split('/')

  const data = await callApi<SmartFolderShowPageResponseBody>(
    'api/pages/teams/smart-folders/show',
    {
      search: {
        ...querystring.parse(search),
        teamId,
        smartFolderId,
      },
      signal,
    }
  )

  return data
}
