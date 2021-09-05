import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { generateMockId, getCurrentTime } from './utils'

export type MockWorkspace = Omit<
  SerializedWorkspace,
  'team' | 'owner' | 'permissions' | 'positions'
>

const teamWorkspaceSetMap = new Map<string, Set<string>>()
const workspaceMap = new Map<string, SerializedWorkspace>()

interface CreateMockWorkspaceParams {
  teamId: string
  ownerId?: string
  name: string
  personal?: boolean
  default?: boolean
  public: boolean
}

export function createMockWorkspace({
  teamId,
  ownerId,
  name,
  personal = false,
  default: defaultWorkspace = false,
  public: publicWorkspace = true,
}: CreateMockWorkspaceParams) {
  const id = generateMockId()
  const now = getCurrentTime()
  const newWorkspace = {
    id,
    name,
    teamId,
    personal,
    default: defaultWorkspace,
    public: publicWorkspace,
    ownerId,
    createdAt: now,
    updatedAt: now,
  }

  workspaceMap.set(id, newWorkspace)

  addTeamWorkspace(id, teamId)

  return newWorkspace
}

export function removeMockWorkspace(id: string) {
  const workspace = getMockWorkspaceById(id)
  if (workspace == null) {
    return
  }

  workspaceMap.delete(id)
  removeTeamWorkspace(id, workspace.teamId)
}

export function getMockWorkspaceById(id: string) {
  return workspaceMap.get(id)
}

export function getMockWorkspacesByTeamId(teamId: string) {
  const workspaceIdList = [...getTeamWorkspaceSet(teamId)]
  return workspaceIdList.reduce<MockWorkspace[]>((list, workspaceId) => {
    const workspace = getMockWorkspaceById(workspaceId)
    if (workspace != null) {
      list.push(workspace)
    }

    return list
  }, [])
}

function getTeamWorkspaceSet(teamId: string) {
  return teamWorkspaceSetMap.get(teamId) || new Set<string>()
}

function addTeamWorkspace(id: string, teamId: string) {
  const teamWorkspaceSet = getTeamWorkspaceSet(teamId)
  teamWorkspaceSet.add(id)
  teamWorkspaceSetMap.set(teamId, teamWorkspaceSet)
}

function removeTeamWorkspace(id: string, teamId: string) {
  const teamWorkspaceSet = getTeamWorkspaceSet(teamId)
  teamWorkspaceSet.delete(id)
  teamWorkspaceSetMap.set(teamId, teamWorkspaceSet)
}
