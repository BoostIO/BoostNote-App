import { SerializedUser } from './user'
import { SerializedTeam } from './team'

export type TeamPermissionType = 'admin' | 'member'

export interface SerializableUserTeamPermissionsProps {
  id: string
  role: TeamPermissionType
  userId: string
}

export interface SerializedUnserializableUserTeamPermissionsProps {
  createdAt: string
  updatedAt: string
  user: SerializedUser
  team: SerializedTeam
}

export type SerializedUserTeamPermissions = SerializedUnserializableUserTeamPermissionsProps &
  SerializableUserTeamPermissionsProps
