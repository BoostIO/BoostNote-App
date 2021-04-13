import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import {
  SerializedFolderWithBookmark,
  SerializedFolder,
} from '../../../interfaces/db/folder'
import { stringify } from 'querystring'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import report from '../../../lib/analytics'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'

export interface CreateFolderRequestBody {
  emoji?: string
  description: string
  folderName: string
  parentFolderId?: string
  workspaceId: string
}

export interface CreateFolderResponseBody {
  folder: SerializedFolderWithBookmark
}

export async function createFolder(
  team: SerializedTeam,
  body: CreateFolderRequestBody
) {
  const data = await callApi<CreateFolderResponseBody>(
    `api/teams/${team.id}/folders`,
    {
      json: body,
      method: 'post',
    }
  )

  report('create_folder', { team, folder: data.folder })
  return data
}

export interface UpdateFolderRequestBody {
  emoji?: string
  description?: string
  folderName?: string
  parentFolderId?: string
  workspaceId: string
}

export interface UpdateFolderEmojiResponseBody {
  folder: SerializedFolderWithBookmark
}

export interface UpdateFolderResponseBody {
  folders: SerializedFolderWithBookmark[]
  docs: SerializedDocWithBookmark[]
  workspaces?: SerializedWorkspace[]
}

export async function updateFolder(
  team: SerializedTeam,
  folderId: string,
  body: UpdateFolderRequestBody
) {
  const data = await callApi<UpdateFolderResponseBody>(
    `api/teams/${team.id}/folders/${folderId}`,
    {
      json: body,
      method: 'put',
    }
  )
  report('update_folder')
  return data
}

export interface DestroyFolderResponseBody {
  parentFolder?: SerializedFolderWithBookmark
  docsIds: string[]
  foldersIds: string[]
  docs?: SerializedDocWithBookmark[]
  workspace?: SerializedWorkspace
}

export async function destroyFolder(
  team: { id: string },
  folder: { id: string }
) {
  const data = await callApi<DestroyFolderResponseBody>(
    `api/teams/${team.id}/folders/${folder.id}`,
    {
      method: 'delete',
    }
  )

  report('delete_folder', { team, folder })
  return data
}

export async function updateFolderEmoji(
  folder: SerializedFolder,
  emoji?: string
) {
  const data = await callApi<UpdateFolderEmojiResponseBody>(
    `api/teams/${folder.teamId}/folders/${folder.id}/emoji`,
    {
      json: { emoji },
      method: 'put',
    }
  )
  report('update_folder')
  return data
}

export interface GetAllFoldersRequestBody {
  exclude?: string[]
}

export interface GetAllFoldersResponseBody {
  folders: SerializedFolderWithBookmark[]
}

export async function getAllFoldersFromTeam(
  teamId: string,
  foldersToExclude: string[] = []
) {
  const data = await callApi<GetAllFoldersResponseBody>(
    `api/teams/${teamId}/folders`,
    {
      search: stringify({ exclude: foldersToExclude }),
    }
  )
  return data
}
