import { SerializedUser } from '../../../interfaces/db/user'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { callApi } from '../../../lib/client'

export interface SettingsPageResponseBody {
  currentUser: SerializedUser
}

export async function getSettingsPageData({
  search,
  signal,
}: GetInitialPropsParameters) {
  const data = await callApi<SettingsPageResponseBody>('api/pages/settings', {
    search,
    signal,
  })

  return data
}
