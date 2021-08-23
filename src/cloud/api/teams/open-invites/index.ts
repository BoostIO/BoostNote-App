import { callApi } from '../../../lib/client'
import { SerializedOpenInvite } from '../../../interfaces/db/openInvite'

export interface GetOpenInviteResponseBody {
  invites: SerializedOpenInvite[]
}

export async function getOpenInvites(teamId: string) {
  const data = await callApi<GetOpenInviteResponseBody>(
    `api/teams/${teamId}/open-invites`
  )
  return data
}

export interface CreateOpenInviteResponseBody {
  invites: SerializedOpenInvite[]
}

export async function createOpenInvites(teamId: string) {
  const data = await callApi<CreateOpenInviteResponseBody>(
    `api/teams/${teamId}/open-invites`,
    {
      method: 'post',
    }
  )
  return data
}

export async function cancelOpenInvites(teamId: string) {
  const data = await callApi<CreateOpenInviteResponseBody>(
    `api/teams/${teamId}/open-invites/delete`,
    { method: 'delete' }
  )
  return data
}
