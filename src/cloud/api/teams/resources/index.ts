import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import querystring from 'querystring'
import { SerializedTag } from '../../../interfaces/db/tag'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { callApi } from '../../../lib/client'
import { SerializedSmartFolder } from '../../../interfaces/db/smartFolder'
import { SerializedAppEvent } from '../../../interfaces/db/appEvents'

export interface MoveResourceRequestBody {
  targetedResourceId: string
  targetedPosition: number
}

export interface MoveResourceResponseBody {
  docs: SerializedDocWithBookmark[]
  folders: SerializedFolderWithBookmark[]
  workspaces?: SerializedWorkspace[]
}

export async function moveResource(
  team: { id: string },
  resourceId: string,
  body: MoveResourceRequestBody
): Promise<MoveResourceResponseBody> {
  const data = await callApi<MoveResourceResponseBody>(
    `api/teams/${team.id}/resources/${resourceId}`,
    { json: body, method: 'put' }
  )
  return data
}

export interface GetResourcesRequestQuery {
  resourcesIds: string[]
  workspacesIds?: string[]
  minimal?: boolean
}

export interface GetResourcesResponseBody {
  folders: SerializedFolderWithBookmark[]
  docs: SerializedDocWithBookmark[]
  workspaces: SerializedWorkspace[]
  tags?: SerializedTag[]
  smartFolders?: SerializedSmartFolder[]
  appEvents?: SerializedAppEvent[]
}

export async function getResources(
  teamId: string,
  query: GetResourcesRequestQuery = { resourcesIds: [], workspacesIds: [] }
) {
  const data = await callApi<GetResourcesResponseBody>(
    `api/teams/${teamId}/resources`,
    {
      search: querystring.stringify(query as any),
    }
  )
  return data
}
