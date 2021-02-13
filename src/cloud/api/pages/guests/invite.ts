import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { SerializedGuestInvite } from '../../../interfaces/db/guest'

export interface GuestInvitePageResponseBody {
  invite: SerializedGuestInvite
}

export async function getGuestInvitePageData({
  search,
  signal,
}: GetInitialPropsParameters) {
  const data = await callApi<GuestInvitePageResponseBody>(
    'api/pages/guests/invite',
    {
      search,
      signal,
    }
  )

  return data
}
