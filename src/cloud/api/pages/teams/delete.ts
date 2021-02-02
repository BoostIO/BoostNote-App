import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export type DeleteTeamPageResponseBody = {
  team: SerializedTeam
}

export async function getDeleteTeamPageData({
  pathname,
  search,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')
  const data = await callApi<DeleteTeamPageResponseBody>(
    'api/pages/teams/delete',
    {
      search: search + `&teamId=${teamId}`,
    }
  )

  return data
}
