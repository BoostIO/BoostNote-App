import { callApi } from '../../../lib/client'

export async function getExternalEntity(
  team: string,
  type: string,
  id: string,
  refresh: boolean
) {
  return callApi(`/api/teams/${team}/externalEntity`, {
    search: {
      type,
      id,
      refresh: refresh ? 'true' : 'false',
    },
    headers: {
      Accept: 'application/json',
    },
  })
}
