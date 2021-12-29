import { SerializedSource } from '../../../interfaces/db/source'
import { SerializedTeam } from '../../../interfaces/db/team'
import { callApi } from '../../../lib/client'

export async function listSources(
  team: SerializedTeam,
  filters?: { type: string }
) {
  const data = await callApi<{ sources: SerializedSource[] }>(
    `api/teams/${team.id}/sources`,
    {
      method: 'get',
      search: { ...filters },
    }
  )
  return data
}

export async function deleteSource(team: SerializedTeam, sourceId: string) {
  const data = await callApi<{}>(`api/teams/${team.id}/sources/${sourceId}`, {
    method: 'delete',
  })
  return data
}
