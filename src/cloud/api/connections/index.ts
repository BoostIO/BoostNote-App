import { SerializedServiceConnection } from '../../interfaces/db/connections'
import { callApi } from '../../lib/client'

export interface OAuthInfo {
  code: string
  state: string
}

export interface CreateServiceConnectionFromOAuthResponseBody {
  connection: SerializedServiceConnection
}

export async function createServiceConnectionFromOAuth(
  service: string,
  info: OAuthInfo
) {
  const result = await callApi<CreateServiceConnectionFromOAuthResponseBody>(
    `api/oauth/${service}/callback`,
    {
      search: info as any,
    }
  )
  return result
}

export interface GetConnectionFilterQuery {
  service: string
  identifier: string
}

export interface GetUserConnectionFiltersResponseBody {
  connections: SerializedServiceConnection[]
}

export async function getUserServiceConnections(
  query?: GetConnectionFilterQuery
) {
  return callApi<GetUserConnectionFiltersResponseBody>(
    `api/users/connections`,
    {
      search: query as any,
    }
  )
}

export async function deleteUserServiceConnection(
  connection: SerializedServiceConnection
) {
  await callApi(`api/users/connections/${connection.id}`, {
    method: 'delete',
  })
}
