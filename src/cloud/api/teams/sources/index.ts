import { SerializedSource } from '../../../interfaces/db/source'
import { SerializedTeam } from '../../../interfaces/db/team'
import { callApi } from '../../../lib/client'

export async function listSources(
  team: SerializedTeam,
  filters?: { type: string }
) {
  const data = await callApi<{ sources: SerializedSource[] }>(`api/sources`, {
    method: 'get',
    search: { ...filters, teamId: team.id },
  })
  return data
}

export async function deleteSource(_team: SerializedTeam, sourceId: string) {
  const data = await callApi<{}>(`api/sources/${sourceId}`, {
    method: 'delete',
  })
  return data
}
