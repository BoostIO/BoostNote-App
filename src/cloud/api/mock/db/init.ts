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
  createMockWorkspace({
    teamId: team.id,
    default: true,
    public: true,
    name: 'Folders',
  })
  createMockPermissions({ userId: user.id, teamId: team.id, role: 'admin' })

  return {
    user,
    team,
  }
}
