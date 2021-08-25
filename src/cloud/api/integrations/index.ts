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

export interface IntegrationActionTypes {
  ['orgs:list']: {
    id: string
    login: string
  }[]
  ['org:repos']: {
    id: string
    name: string
    owner: {
      login: string
    }
  }[]
  ['repo:issues']: any[]
  ['repo:labels']: {
    id: number
    name: string
    color: string
    description: string
  }[]
  ['repo:collaborators']: { id: number; avatar_url: string; login: string }[]
}

export async function getAction<A extends keyof IntegrationActionTypes>(
  integration: Pick<SerializedTeamIntegration, 'id'>,
  action: A,
  args?: Record<string, any>
): Promise<IntegrationActionTypes[A]> {
  const { data } = await callApi(`/api/integrations/${integration.id}/action`, {
    search: { action, ...args },
  })
  return data
}

export interface IntegrationPostActionTypes {
  ['issue:assign']: any
  ['issue:update']: any
}

export async function postAction<A extends keyof IntegrationPostActionTypes>(
  integration: Pick<SerializedTeamIntegration, 'id'>,
  action: A,
  args?: Record<string, any>,
  body?: any
): Promise<IntegrationPostActionTypes[A]> {
  const { data } = await callApi(`/api/integrations/${integration.id}/action`, {
    search: { action, ...args },
    json: body,
    method: 'post',
  })
  return data
}
