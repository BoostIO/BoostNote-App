import { SerializedOpenInvite } from '../../../interfaces/db/openInvite'
import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { SerializedTeam } from '../../../interfaces/db/team'

export interface TeamBulkInvitesPageData {
  team: SerializedTeam
  openInvite?: SerializedOpenInvite
}

export async function getTeamBulkInvitesPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')
  const data = await callApi<TeamBulkInvitesPageData>(
    'api/pages/teams/invites',
    {
      search: search + `&teamId=${teamId}`,
      signal,
    }
  )

  return data
}
