import { SerializedTeam } from './team'
import { SerializedUserTeamPermissions } from './userTeamPermissions'
import { SerializedWorkspacePositions } from './workspacePositions'

export interface SerializableWorkspaceProps {
  id: string
  name: string
  teamId: string
  personal: boolean
  default: boolean
  public: boolean
  ownerId?: string
}

export interface SerializedUnserializableWorkspaceProps {
  team?: SerializedTeam
  owner?: SerializedUserTeamPermissions
  permissions?: SerializedUserTeamPermissions[]
  positions?: SerializedWorkspacePositions
  createdAt: string
  updatedAt: string
}

export type SerializedWorkspace = SerializedUnserializableWorkspaceProps &
  SerializableWorkspaceProps
