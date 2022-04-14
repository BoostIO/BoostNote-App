import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import {
  SerializedFolderWithBookmark,
  SerializedFolder,
} from '../../../interfaces/db/folder'
import { stringify } from 'querystring'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
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
  parentFolder: SerializedFolderWithBookmark
}

export async function createFolder(
  team: SerializedTeam,
  body: CreateFolderRequestBody
) {
  const data = await callApi<CreateFolderResponseBody>(`api/folders`, {
    json: { ...body, teamId: team.id },
    method: 'post',
  })

  return data
}

export interface UpdateFolderRequestBody {
  emoji?: string | null
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
  docs: SerializedDocWithSupplemental[]
  workspaces?: SerializedWorkspace[]
}

export async function updateFolder(
  _team: { id: string },
  folderId: string,
  body: UpdateFolderRequestBody
) {
  const data = await callApi<UpdateFolderResponseBody>(
    `api/folders/${folderId}`,
    {
      json: body,
      method: 'put',
    }
  )
  return data
}
export interface UpdateFolderEmojiResponseBody {
  folder: SerializedFolderWithBookmark
}

export interface UpdateFolderResponseBody {
  folders: SerializedFolderWithBookmark[]
  docs: SerializedDocWithSupplemental[]
  workspaces?: SerializedWorkspace[]
}

export async function updateFolderPageOrder(
  folder: SerializedFolder,
  moveAheadOf: string
) {
  const data = await callApi<UpdateFolderResponseBody>(
    `api/teams/${folder.teamId}/folders/${folder.id}/page-order`,
    {
      json: {
        moveAheadOf,
      },
      method: 'put',
    }
  )
  return data
}

export interface DestroyFolderResponseBody {
  parentFolder?: SerializedFolderWithBookmark
  docsIds: string[]
  foldersIds: string[]
  docs?: SerializedDocWithSupplemental[]
  workspace?: SerializedWorkspace
}

export async function destroyFolder(
  _team: { id: string },
  folder: { id: string }
) {
  const data = await callApi<DestroyFolderResponseBody>(
    `api/folders/${folder.id}`,
    {
      method: 'delete',
    }
  )

  return data
}

export async function updateFolderEmoji(
  folder: SerializedFolder,
  emoji?: string
) {
  const data = await callApi<UpdateFolderEmojiResponseBody>(
    `api/folders/${folder.id}`,
    {
      json: { emoji },
      method: 'patch',
    }
  )
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
