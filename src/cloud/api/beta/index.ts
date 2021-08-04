import { callApi } from '../../lib/client'
import { SerializedBetaRegistration } from '../../interfaces/db/betaRegistration'

interface GetaBetaRegistrationResponseBody {
  betaRegistration?: SerializedBetaRegistration
}

export async function getUserBetaRegistration() {
  return callApi<GetaBetaRegistrationResponseBody>(`api/beta`, {
    method: 'get',
  })
}

interface RegisterToBetaRegistrationResponseBody {
  betaRegistration?: SerializedBetaRegistration
}

export async function registerToBeta(teamId?: string) {
  const result = await callApi<RegisterToBetaRegistrationResponseBody>(
    `api/beta`,
    {
      method: 'post',
      json: { teamId },
    }
  )

  return result
}

interface UpdateBetaRegistrationResponseBody {
  betaRegistration: SerializedBetaRegistration
}

export async function updateBetaRegistration(
  betaRegistrationId: string,
  integrations: string[]
) {
  const result = await callApi<UpdateBetaRegistrationResponseBody>(
    `api/beta/${betaRegistrationId}`,
    {
      method: 'put',
      json: { integrations },
    }
  )

  return result
}
