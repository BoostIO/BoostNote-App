import { callApi } from '../../lib/client'
import { SerializedApiToken } from '../../interfaces/db/apiTokens'
import { SerializedTeam } from '../../interfaces/db/team'

interface CreateTokenResponseBody {
  token: SerializedApiToken
}

export async function createToken(name: string, team: SerializedTeam) {
  return callApi<CreateTokenResponseBody>(`api/tokens`, {
    method: 'post',
    json: { name, team: team.id },
  })
}

interface ListTokenFilters {
  team?: string
  name?: string
}

interface ListTokenResponseBody {
  tokens: SerializedApiToken[]
}

export async function listTokens(filters: ListTokenFilters = {}) {
  const result = await callApi<ListTokenResponseBody>(`api/tokens`, {
    search: filters as any,
  })

  return result
}

interface UpdateTokenResponseBody {
  token: SerializedApiToken
}

export async function updateToken(token: SerializedApiToken) {
  const result = await callApi<UpdateTokenResponseBody>(
    `/api/tokens/${token.id}`,
    {
      method: 'put',
      json: {
        name: token.name,
      },
    }
  )
  return result
}

export async function deleteToken(token: SerializedApiToken) {
  await callApi(`/api/tokens/${token.id}`, {
    method: 'delete',
  })
}
