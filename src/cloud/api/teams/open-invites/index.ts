import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedOpenInvite } from '../../../interfaces/db/openInvite'

export interface GetOpenInviteResponseBody {
  invite?: SerializedOpenInvite
}

export async function getOpenInvite(team: SerializedTeam) {
  const data = await callApi<GetOpenInviteResponseBody>(
    `/api/teams/${team.id}/open-invites`
  )
  return data
}

export interface CreateOpenInviteResponseBody {
  invite: SerializedOpenInvite
}

export async function createOpenInvite(team: SerializedTeam) {
  const data = await callApi<CreateOpenInviteResponseBody>(
    `/api/teams/${team.id}/open-invites`,
    {
      method: 'post',
    }
  )
  return data
}

export interface ResetOpenInviteResponseBody {
  invite: SerializedOpenInvite
}

export async function resetOpenInvite(
  team: SerializedTeam,
  invite: SerializedOpenInvite
) {
  const data = await callApi<ResetOpenInviteResponseBody>(
    `/api/teams/${team.id}/open-invites/${invite.id}`,
    { method: 'put' }
  )
  return data
}

export async function cancelOpenInvite(
  team: SerializedTeam,
  invite: SerializedOpenInvite
) {
  const data = await callApi<CreateOpenInviteResponseBody>(
    `/api/teams/${team.id}/open-invites/${invite.id}`,
    { method: 'delete' }
  )
  return data
}
