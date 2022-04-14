import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedTeamInvite } from '../../../interfaces/db/teamInvite'

export interface GetInvitesResponseBody {
  invites: SerializedTeamInvite[]
}

export async function getTeamInvites(team: SerializedTeam) {
  const data = await callApi<GetInvitesResponseBody>(
    `api/invites?teamId=${team.id}`
  )
  return data
}

export interface CreateInviteRequestBody {
  email: string
  role: string
}

export interface CreateInviteResponseBody {
  invite: SerializedTeamInvite
}

export async function createTeamInvite(
  team: SerializedTeam,
  body: CreateInviteRequestBody
) {
  const data = await callApi<CreateInviteResponseBody>(`api/invites`, {
    json: { ...body, teamId: team.id },
    method: 'post',
  })
  return data
}

export interface CreateBulkInvitesRequestBody {
  emails: string[]
}

export interface CreateBulkInvitesResponseBody {
  invites: SerializedTeamInvite[]
}

export async function createTeamInvitesInBulk(
  team: { id: string },
  body: CreateBulkInvitesRequestBody
) {
  const data = await callApi<CreateBulkInvitesResponseBody>(
    `api/invites/bulk`,
    {
      json: { ...body, teamId: team.id },
      method: 'post',
    }
  )
  return data
}

export async function cancelTeamInvite(
  _team: SerializedTeam,
  invite: SerializedTeamInvite
) {
  const data = await callApi(`api/invites/${invite.id}`, {
    method: 'delete',
  })
  return data
}
