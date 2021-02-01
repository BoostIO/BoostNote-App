import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export type DeleteTeamPageResponseBody = {
  team: SerializedTeam
}

export async function getDeleteTeamPageData({
  search,
}: GetInitialPropsParameters) {
  const data = await callApi<DeleteTeamPageResponseBody>(
    'api/pages/teams/delete',
    {
      search,
    }
  )

  return data
}
