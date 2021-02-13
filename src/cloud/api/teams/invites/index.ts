import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedTeamInvite } from '../../../interfaces/db/teamInvite'
import report from '../../../lib/analytics'

export interface GetInvitesResponseBody {
  invites: SerializedTeamInvite[]
}

export async function getTeamInvites(team: SerializedTeam) {
  const data = await callApi<GetInvitesResponseBody>(
    `api/teams/${team.id}/invites`
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
  const data = await callApi<CreateInviteResponseBody>(
    `api/teams/${team.id}/invites`,
    {
      json: body,
      method: 'post',
    }
  )
  report('create_invite', { team, invite: data.invite })
  return data
}

export interface CreateBulkInvitesRequestBody {
  emails: string[]
}

export interface CreateBulkInvitesResponseBody {
  invites: SerializedTeamInvite[]
}

export async function createTeamInvitesInBulk(
  team: SerializedTeam,
  body: CreateBulkInvitesRequestBody
) {
  const data = await callApi<CreateBulkInvitesResponseBody>(
    `api/teams/${team.id}/invites/bulk`,
    {
      json: body,
      method: 'post',
    }
  )
  data.invites.forEach((invite) =>
    report('create_invite', { team, invite: invite })
  )
  return data
}

export async function cancelTeamInvite(
  team: SerializedTeam,
  invite: SerializedTeamInvite
) {
  const data = await callApi(`api/teams/${team.id}/invites/${invite.id}`, {
    method: 'delete',
  })
  report('delete_invite', { team, invite: invite })
  return data
}
