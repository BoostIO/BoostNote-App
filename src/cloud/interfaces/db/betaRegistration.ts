import { SerializedTeam } from './team'
import { SerializedUser } from './user'

export interface BetaRegistrationState {
  integrations: string[]
}

export interface SerializableBetaRegistrationProps {
  id: string
  teamId?: string
  userId: string
  state: BetaRegistrationState
}

export interface SerializedUnserializableBetaRegistrationProps {
  createdAt: string
  team?: SerializedTeam
  user: SerializedUser
}

export type SerializedBetaRegistration = SerializedUnserializableBetaRegistrationProps &
  SerializableBetaRegistrationProps
