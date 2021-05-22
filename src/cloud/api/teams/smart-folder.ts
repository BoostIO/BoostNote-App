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

export interface UpdateSmartFolderRequestBody {
  name: string
  condition: SerializedPrimaryCondition
  private: boolean
}

export interface UpdateSmartFolderResponseBody {
  smartFolder: SerializedSmartFolder
}

export async function updateSmartFolder(
  team: SerializedTeam,
  smartFolder: SerializedSmartFolder,
  body: CreateSmartFolderRequestBody
) {
  const data = await callApi<CreateSmartFolderResponseBody>(
    `/api/teams/${team.id}/smart-folders/${smartFolder.id}`,
    {
      json: body,
      method: 'put',
    }
  )

  return data
}

export interface UpdateSmartFolderRequestBody {
  name: string
  condition: SerializedPrimaryCondition
  private: boolean
}

export interface UpdateSmartFolderResponseBody {
  smartFolder: SerializedSmartFolder
}

export async function deleteSmartFolder(
  team: SerializedTeam,
  smartFolder: SerializedSmartFolder
) {
  const data = await callApi<CreateSmartFolderResponseBody>(
    `/api/teams/${team.id}/smart-folders/${smartFolder.id}`,
    {
      method: 'delete',
    }
  )

  return data
}
