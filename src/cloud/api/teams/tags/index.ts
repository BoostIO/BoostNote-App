import { SerializedTag } from '../../../interfaces/db/tag'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { callApi } from '../../../lib/client'

export interface CreateTagRequestBody {
  docId: string
  text: string
}

export interface CreateTagResponseBody {
  tag: SerializedTag
  doc: SerializedDocWithSupplemental
}

export async function createTag(
  team: SerializedTeam,
  body: CreateTagRequestBody
) {
  const data = await callApi<CreateTagResponseBody>(
    `api/teams/${team.id}/tags`,
    {
      json: body,
      method: 'post',
    }
  )
  return data
}

export interface UpdateTagResponseBody {
  tag: SerializedTag
}

export interface UpdateTagRequestBody {
  text: string
}

export async function updateTag(
  teamId: string,
  tagId: string,
  body: UpdateTagRequestBody
) {
  const data = await callApi<{}>(`api/teams/${teamId}/tags/${tagId}`, {
    method: 'put',
    json: body,
  })
  return data
}

export async function deleteTag(teamId: string, tagId: string) {
  const data = await callApi<{}>(`api/teams/${teamId}/tags/${tagId}`, {
    method: 'delete',
  })
  return data
}
