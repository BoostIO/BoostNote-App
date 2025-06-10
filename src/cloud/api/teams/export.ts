import { callApiBlob } from '../../lib/client'

export async function exportWorkspace(teamId: string) {
  const data = await callApiBlob(`api/teams/${teamId}/export`, {
    method: 'get',
  })
  return data
}
