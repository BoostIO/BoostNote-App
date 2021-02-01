import { SerializedOpenInvite } from '../../../interfaces/db/openInvite'
import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export interface TeamOpenInvitePageData {
  invite: SerializedOpenInvite
}

export async function getTeamOpenInvitePageData({
  search,
}: GetInitialPropsParameters) {
  const data = await callApi<TeamOpenInvitePageData>(
    'api/pages/teams/open-invites/show',
    {
      search,
    }
  )

  return data
}
