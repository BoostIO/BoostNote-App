import { callApi } from '../../lib/client'
import { SerializedTeamIntegration } from '../../interfaces/db/connections'

export interface GetTeamIntegrationsResponseBody {
  integrations: SerializedTeamIntegration[]
}

export async function getTeamIntegrations(team: string) {
  return callApi<GetTeamIntegrationsResponseBody>(`api/integrations`, {
    search: { team },
  })
}

export async function deleteTeamIntegration(
  integration: SerializedTeamIntegration
) {
  return callApi(`api/integrations/${integration.id}`, { method: 'delete' })
}
