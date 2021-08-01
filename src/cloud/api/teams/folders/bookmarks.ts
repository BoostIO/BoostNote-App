import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { callApi } from '../../../lib/client'

export interface CreateFolderBookmarkResponseBody {
  folder: SerializedFolderWithBookmark
}

export async function createFolderBookmark(teamId: string, folderId: string) {
  const data = await callApi<CreateFolderBookmarkResponseBody>(
    `api/teams/${teamId}/folders/${folderId}/bookmarks`,
    { method: 'post' }
  )

  return data
}

export interface DestroyFolderBookmarkResponseBody {
  folder: SerializedFolderWithBookmark
}

export async function destroyFolderBookmark(teamId: string, folderId: string) {
  const data = await callApi<DestroyFolderBookmarkResponseBody>(
    `api/teams/${teamId}/folders/${folderId}/bookmarks`,
    { method: 'delete' }
  )

  return data
}
