import { SerializedTeam } from './team'
import { SerializedUser } from './user'

export interface SerializableBetaRegistrationProps {
  id: string
  teamId?: string
  userId: string
}

export interface SerializedUnserializableBetaRegistrationProps {
  createdAt: string
  user: SerializedUser
  team?: SerializedTeam
}

export type SerializedBetaRegistration = SerializedUnserializableBetaRegistrationProps &
  SerializableBetaRegistrationProps
