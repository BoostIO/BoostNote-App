import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { callApi } from '../../../lib/client'

export interface GetWorkspaceResponseBody {
  workspaces: SerializedWorkspace[]
}

export async function getWorkspaces(teamId?: string) {
  return callApi<GetWorkspaceResponseBody>(
    `api/workspaces${teamId != null ? `?teamId=${teamId}` : ''}`
  )
}

export type CreateWorkspaceRequestBody = {
  name: string
  permissions: string[]
  public: boolean
  personal?: boolean
}

export interface CreateWorkspaceResponseBody {
  workspace: SerializedWorkspace
}

export async function createWorkspace(
  team: { id: string },
  body: CreateWorkspaceRequestBody
) {
  const data = await callApi<CreateWorkspaceResponseBody>(`api/workspaces`, {
    json: { ...body, teamId: team.id },
    method: 'post',
  })
  return data
}

export interface UpdateWorkspaceRequestBody {
  name: string
  permissions: string[]
  public: boolean
}

export interface UpdateWorkspaceResponseBody {
  workspace: SerializedWorkspace
}

export async function updateWorkspace(
  _team: { id: string },
  workspaceId: string,
  body: UpdateWorkspaceRequestBody
) {
  const data = await callApi<UpdateWorkspaceResponseBody>(
    `api/workspaces/${workspaceId}`,
    {
      json: body,
      method: 'put',
    }
  )
  return data
}

export interface DestroyWorkspaceResponseBody {
  publicWorkspace?: SerializedWorkspace
}

export async function destroyWorkspace(
  _team: { id: string },
  workspace: { id: string },
  destroyContent = false
) {
  const data = await callApi<DestroyWorkspaceResponseBody>(
    `api/workspaces/${workspace.id}`,
    {
      search: {
        destroyContent,
      },
      method: 'delete',
    }
  )
  return data
}
