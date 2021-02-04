import { SerializedOpenInvite } from '../../../interfaces/db/openInvite'
import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export interface TeamOpenInvitePageData {
  invite: SerializedOpenInvite
}

export async function getTeamOpenInvitePageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')
  const data = await callApi<TeamOpenInvitePageData>(
    'api/pages/teams/open-invites/show',
    {
      search: search + `&teamId=${teamId}`,
      signal,
    }
  )

  return data
}
