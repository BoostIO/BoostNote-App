import { createMockFolder } from './folders'
import { createMockPermissions } from './permissions'
import { createMockTeam } from './teams'
import { createMockUser } from './users'
import { createMockWorkspace } from './workspaces'

export function init() {
  const user = createMockUser({
    uniqueName: 'dev-user',
    displayName: 'dev-user',
  })
  const team = createMockTeam({ name: 'dev', domain: 'dev' })
  const workspace = createMockWorkspace({
    teamId: team.id,
    default: true,
    public: true,
    name: 'Folders',
  })
  createMockPermissions({ userId: user.id, teamId: team.id, role: 'admin' })
  createMockFolder({
    name: 'Folder 1',
    teamId: team.id,
    workspaceId: workspace.id,
  })

  return {
    user,
    team,
  }
}
