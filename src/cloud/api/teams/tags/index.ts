import { SerializedTag } from '../../../interfaces/db/tag'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { callApi } from '../../../lib/client'

export interface CreateTagRequestBody {
  docId: string
  text: string
}

export interface CreateTagResponseBody {
  tag: SerializedTag
  doc: SerializedDocWithBookmark
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

export async function deleteTag(teamId: string, tagId: string) {
  const data = await callApi<{}>(`api/teams/${teamId}/tags/${tagId}`, {
    method: 'delete',
  })
  return data
}
