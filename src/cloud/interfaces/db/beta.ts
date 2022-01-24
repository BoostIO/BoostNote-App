import { SerializedTeam } from './team'

export const allowedBetaFeatures: BetaFeature[] = ['automations']

export interface BetaRegistrationState {
  automations?: boolean
}

export type BetaFeature = keyof BetaRegistrationState

export interface SerializableBetaRegistrationProps {
  id: string
  teamId: string
  state: BetaRegistrationState
}

export interface SerializedUnserializableBetaRegistrationProps {
  createdAt: string
  team: SerializedTeam
}

export type SerializedBetaRegistration = SerializedUnserializableBetaRegistrationProps &
  SerializableBetaRegistrationProps
