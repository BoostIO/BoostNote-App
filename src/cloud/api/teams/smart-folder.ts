import { callApi } from '../../lib/client'
import { SerializedTeam } from '../../interfaces/db/team'
import {
  SerializedPrimaryCondition,
  SerializedSmartFolder,
} from '../../interfaces/db/smartFolder'

export interface CreateSmartFolderRequestBody {
  name: string
  condition: SerializedPrimaryCondition
  private: boolean
}

export interface CreateSmartFolderResponseBody {
  smartFolder: SerializedSmartFolder
}

export async function createSmartFolder(
  team: SerializedTeam,
  body: CreateSmartFolderRequestBody
) {
  const data = await callApi<CreateSmartFolderResponseBody>(
    `/api/teams/${team.id}/smart-folders`,
    {
      json: body,
      method: 'post',
    }
  )

  return data
}
