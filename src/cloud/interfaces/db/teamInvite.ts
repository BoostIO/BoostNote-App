import { SerializedTeam } from './team'
import { SerializedUser } from './user'

export interface SerializableTeamInviteProps {
  id: string
  role: string
  email: string
  pending: boolean
  accepted: boolean
}

export interface SerializedUnserializableTeamInviteProps {
  createdAt: string
  updatedAt: string
  inviter: SerializedUser
  user?: SerializedUser
  canceller?: SerializedUser
  team: SerializedTeam
}

export type SerializedTeamInvite = SerializedUnserializableTeamInviteProps &
  SerializableTeamInviteProps
