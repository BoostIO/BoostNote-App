import { Team } from '../../lib/db/entities/Team'
import { SerializedTeam } from './team'
import { SerializedUser } from './user'
import { User } from '../../lib/db/entities/User'

export interface SerializableTeamInviteProps {
  id: string
  role: string
  email: string
  pending: boolean
  accepted: boolean
}

export interface UnserializableTeamInviteProps {
  createdAt: Date
  updatedAt: Date
  inviter: User
  team: Team
  user?: User
  canceller?: User
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
