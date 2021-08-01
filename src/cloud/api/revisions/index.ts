import { callApi } from '../../lib/client'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedDoc } from '../../interfaces/db/doc'
import { SerializedRevision } from '../../interfaces/db/revision'

export interface CreateRevisionRequestBody {
  content: string
  title: string
  message?: string
}
export interface CreateRevisionResponseBody {
  revision: SerializedRevision
}

export async function createDocRevision(
  team: SerializedTeam,
  doc: SerializedDoc,
  body: CreateRevisionRequestBody
) {
  const data = await callApi<CreateRevisionResponseBody>(
    `api/teams/${team.id}/docs/${doc.id}/revisions`,
    { method: 'post', json: body }
  )

  return data as CreateRevisionResponseBody
}
