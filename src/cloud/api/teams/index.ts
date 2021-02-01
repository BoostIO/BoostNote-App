import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedIcon } from '../../interfaces/db/icon'
import report from '../../lib/analytics'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import { UrlLike } from '../../components/atoms/Link/CustomLink'
import { UrlObject } from 'url'
import { callApi } from '../../lib/client'

export interface ListTeamsResponseBody {
  teams: SerializedTeam[]
}

export async function listTeams() {
  const data = await callApi<ListTeamsResponseBody>(`api/teams`)
  return data
}

export interface CreateTeamRequestBody {
  name: string
  domain?: string
}

export interface CreateTeamResponseBody {
  team: SerializedTeam
  doc?: SerializedDocWithBookmark
}

export async function createTeam(body: CreateTeamRequestBody) {
  const response = await callApi(`api/teams`, {
    json: body,
    method: 'post',
  })
  const data = response.data as CreateTeamResponseBody
  report('create_team', { team: data.team })
  return data
}

export interface UpdateTeamRequestBody {
  name: string
  state?: string
}

export interface UpdateTeamIconResponseBody {
  icon: SerializedIcon
}

export interface UpdateTeamResponseBody {
  team: SerializedTeam
}

export interface DestroyTeamResponseBody {
  redirectTo: { href: UrlLike; as?: UrlObject | string }
}

export async function updateTeam(id: string, body: UpdateTeamRequestBody) {
  const response = await callApi(`api/teams/${id}`, {
    json: body,
    method: 'put',
  })
  report('update_team_profile')
  return response.data as UpdateTeamResponseBody
}

export async function destroyTeam(id: string) {
  const data = await callApi<DestroyTeamResponseBody>(`api/teams/${id}`, {
    method: 'delete',
  })
  report('delete_team', { team: { id } })
  return data
}

export async function updateTeamIcon(team: SerializedTeam, file: File) {
  const formData = new FormData()
  formData.set('icon', file)
  const data = await callApi<UpdateTeamIconResponseBody>(
    `api/teams/${team.id}/icon`,
    {
      body: formData,
      method: 'post',
    }
  )
  return data
}
