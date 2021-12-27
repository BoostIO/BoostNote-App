import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import querystring from 'querystring'
import { SerializedTag } from '../../../interfaces/db/tag'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { callApi } from '../../../lib/client'
import { SerializedSmartView } from '../../../interfaces/db/smartView'
import { SerializedAppEvent } from '../../../interfaces/db/appEvents'
import { SerializedView, SupportedViewTypes } from '../../../interfaces/db/view'
import { SerializedDashboard } from '../../../interfaces/db/dashboard'

export interface MoveResourceRequestBody {
  targetedResourceId: string
  targetedPosition: number
}

export interface MoveResourceResponseBody {
  docs: SerializedDocWithSupplemental[]
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
  docs: SerializedDocWithSupplemental[]
  workspaces: SerializedWorkspace[]
  tags?: SerializedTag[]
  smartViews?: SerializedSmartView[]
  appEvents?: SerializedAppEvent[]
  views?: SerializedView<SupportedViewTypes>[]
  dashboards?: SerializedDashboard[]
}

export async function getResources(
  teamId: string,
  query: GetResourcesRequestQuery = { resourcesIds: [], workspacesIds: [] },
  signal?: AbortSignal
) {
  const data = await callApi<GetResourcesResponseBody>(
    `api/teams/${teamId}/resources`,
    {
      search: querystring.stringify(query as any),
      signal,
    }
  )
  return data
}
