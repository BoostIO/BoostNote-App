import { resetMockDocs } from './mockEntities/docs'
import { createMockFolder, resetMockFolders } from './mockEntities/folders'
import {
  createMockPermissions,
  resetMockPermissions,
} from './mockEntities/permissions'
import { createMockTeam, resetMockTeams } from './mockEntities/teams'
import { createMockUser, resetMockUsers } from './mockEntities/users'
import {
  createMockWorkspace,
  resetMockWorkspaces,
} from './mockEntities/workspaces'

export const defaultUserProps = {
  uniqueName: 'dev-user',
  displayName: 'dev-user',
}

export const defaultTeamProps = {
  name: 'dev',
  domain: 'dev',
}

export function initMockData() {
  resetMockData()
  const user = createMockUser(defaultUserProps)
  localStorage.setItem('mock:defaultUserId', user.id)
  const team = createMockTeam(defaultTeamProps)
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
}

export function resetMockData() {
  resetMockDocs()
  resetMockFolders()
  resetMockPermissions()
  resetMockTeams()
  resetMockUsers()
  resetMockWorkspaces()
  localStorage.removeItem('mock:defaultUserId')
}

export function getDefaultMockUserId() {
  return localStorage.getItem('mock:defaultUserId')
}
