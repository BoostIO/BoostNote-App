import { SerializedTeam } from '../../../interfaces/db/team'
import { callApi } from '../../../lib/client'
import report from '../../../lib/analytics'
import { CreateSubscriptionResponseBody } from '.'

export async function startTeamFreeTrial(team: SerializedTeam) {
  const data = await callApi<CreateSubscriptionResponseBody>(
    `/api/teams/${team.id}/subscription/trial`,
    {
      method: 'post',
    }
  )
  report('create_free_trial')
  return data
}
