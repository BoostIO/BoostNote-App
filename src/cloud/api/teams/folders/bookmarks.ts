import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import report from '../../../lib/analytics'
import { callApi } from '../../../lib/client'

export interface CreateFolderBookmarkResponseBody {
  folder: SerializedFolderWithBookmark
}

export async function createFolderBookmark(teamId: string, folderId: string) {
  const data = await callApi<CreateFolderBookmarkResponseBody>(
    `api/teams/${teamId}/folders/${folderId}/bookmarks`,
    { method: 'post' }
  )
  report('create_bookmark_folder')
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
  report('delete_bookmark_folder')
  return data
}
