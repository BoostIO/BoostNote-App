import { SerializedTeam } from './team'
import { TeamPermissionType } from './userTeamPermissions'

export interface SerializableOpenInviteProps {
  id: string
  role: TeamPermissionType
  slug: string
  teamId: string
}

export interface SerializedUnserializableOpenInviteProps {
  createdAt: string
  updatedAt: string
  team?: SerializedTeam
}

export type SerializedOpenInvite = SerializedUnserializableOpenInviteProps &
  SerializableOpenInviteProps
