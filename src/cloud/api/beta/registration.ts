import { SerializedBetaRegistration } from '../../interfaces/db/beta'
import { callApi } from '../../lib/client'

export interface GetTeamBetaRegistrationResponseBody {
  data?: SerializedBetaRegistration
}

export async function getTeamBetaRegistration(teamId: string) {
  return callApi<GetTeamBetaRegistrationResponseBody>(
    `api/beta/registrations`,
    {
      method: 'get',
      search: { team: teamId },
    }
  )
}
