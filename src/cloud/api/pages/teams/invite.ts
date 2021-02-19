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
  const [, teamId, , inviteId] = pathname.split('/')
  const data = await callApi<TeamOpenInvitePageData>(
    'api/pages/teams/open-invites/show',
    {
      search: search + `&teamId=${teamId}&inviteId=${inviteId}`,
      signal,
    }
  )

  return data
}
