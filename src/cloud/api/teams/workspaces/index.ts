import { SerializedTeam } from '../../../interfaces/db/team'
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

export interface CreateWorkspaceRequestBody {
  name: string
  permissions: string[]
  public: boolean
}

export interface CreateWorkspaceResponseBody {
  workspace: SerializedWorkspace
}

export async function createWorkspace(
  team: SerializedTeam,
  body: CreateWorkspaceRequestBody
) {
  const data = await callApi<CreateWorkspaceResponseBody>(
    `api/teams/${team.id}/workspaces`,
    {
      json: body,
      method: 'post',
    }
  )
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
  team: { id: string },
  workspaceId: string,
  body: UpdateWorkspaceRequestBody
) {
  const data = await callApi<UpdateWorkspaceResponseBody>(
    `api/teams/${team.id}/workspaces/${workspaceId}`,
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
  team: { id: string },
  workspace: { id: string },
  destroyContent = false
) {
  const data = await callApi<DestroyWorkspaceResponseBody>(
    `api/teams/${team.id}/workspaces/${workspace.id}`,
    {
      search: {
        destroyContent,
      },
      method: 'delete',
    }
  )
  return data
}
