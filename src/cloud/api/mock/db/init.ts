import { GeneralAppProps } from '../../../interfaces/api'
import { getTeamMockDocs, resetMockDocs } from './mockEntities/docs'
import {
  createMockFolder,
  getMockTeamFolders as getTeamMockFolders,
  resetMockFolders,
} from './mockEntities/folders'
import {
  createMockPermissions,
  getMockPermissionsListByUserId,
  resetMockPermissions,
} from './mockEntities/permissions'
import {
  createMockTeam,
  getMockTeamByDomain,
  resetMockTeams,
} from './mockEntities/teams'
import {
  createMockUser,
  getMockUserById,
  resetMockUsers,
} from './mockEntities/users'
import {
  createMockWorkspace,
  getMockWorkspacesByTeamId,
  resetMockWorkspaces,
} from './mockEntities/workspaces'
import {
  populateDoc,
  populateFolder,
  populatePermissions,
  populateWorkspace,
} from './populate'

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

function getDefaultMockUserId() {
  return localStorage.getItem('mock:defaultUserId')
}

export function getDefaultMockUser() {
  const defaultUserId = getDefaultMockUserId()
  if (defaultUserId == null) {
    return undefined
  }
  return getMockUserById(defaultUserId)
}

export function getGeneralAppProps(domain: string): GeneralAppProps {
  const team = getMockTeamByDomain(domain)
  if (team == null) {
    throw new Error(`The team does not exist. (teamId: ${domain})`)
  }
  const defaultMockUser = getDefaultMockUser()
  const permissions =
    defaultMockUser != null
      ? getMockPermissionsListByUserId(defaultMockUser.id).map(
          populatePermissions
        )
      : []

  const folders = getTeamMockFolders(team.id).map(populateFolder)
  const docs = getTeamMockDocs(team.id).map(populateDoc)
  const workspaces = getMockWorkspacesByTeamId(team.id).map(populateWorkspace)

  return {
    team,
    folders,
    docs,
    permissions,
    workspaces,
    tags: [],
  }
}
