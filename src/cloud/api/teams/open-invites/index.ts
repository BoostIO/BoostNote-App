import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedOpenInvite } from '../../../interfaces/db/openInvite'

export interface GetOpenInviteResponseBody {
  invites: SerializedOpenInvite[]
}

export async function getOpenInvites(team: SerializedTeam) {
  const data = await callApi<GetOpenInviteResponseBody>(
    `api/teams/${team.id}/open-invites`
  )
  return data
}

export interface CreateOpenInviteResponseBody {
  invites: SerializedOpenInvite[]
}

export async function createOpenInvites(team: SerializedTeam) {
  const data = await callApi<CreateOpenInviteResponseBody>(
    `api/teams/${team.id}/open-invites`,
    {
      method: 'post',
    }
  )
  return data
}

export async function cancelOpenInvites(team: SerializedTeam) {
  const data = await callApi<CreateOpenInviteResponseBody>(
    `api/teams/${team.id}/open-invites/delete`,
    { method: 'delete' }
  )
  return data
}
