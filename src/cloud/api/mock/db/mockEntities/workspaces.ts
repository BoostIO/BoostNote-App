import { SerializedWorkspace } from '../../../../interfaces/db/workspace'
import {
  generateMockId,
  getCurrentTime,
  MockDbMap,
  MockDbSetMap,
} from '../utils'

export type MockWorkspace = Omit<
  SerializedWorkspace,
  'team' | 'owner' | 'permissions' | 'positions'
>

const workspaceMap = new MockDbMap<SerializedWorkspace>('mock:workspaceMap')
const teamWorkspaceSetMap = new MockDbSetMap<string>('mock:teamWorkspaceSetMap')

export function resetMockWorkspaces() {
  workspaceMap.reset()
  teamWorkspaceSetMap.reset()
}

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
  teamWorkspaceSetMap.addValue(teamId, id)

  return newWorkspace
}

export function removeMockWorkspace(id: string) {
  const workspace = getMockWorkspaceById(id)
  if (workspace == null) {
    return
  }

  workspaceMap.delete(id)
  teamWorkspaceSetMap.removeValue(workspace.teamId, id)
}

export function getMockWorkspaceById(id: string) {
  return workspaceMap.get(id)
}

export function getMockWorkspacesByTeamId(teamId: string) {
  const workspaceIdList = [...teamWorkspaceSetMap.getSet(teamId)]
  return workspaceIdList.reduce<MockWorkspace[]>((list, workspaceId) => {
    const workspace = getMockWorkspaceById(workspaceId)
    if (workspace != null) {
      list.push(workspace)
    }

    return list
  }, [])
}
