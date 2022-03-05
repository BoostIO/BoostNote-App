import { SerializedTeam } from './team'
import { SerializableUserTeamPermissionsProps } from './userTeamPermissions'

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

export type SerializedBetaRegistration =
  SerializedUnserializableBetaRegistrationProps &
    SerializableBetaRegistrationProps

export interface SerializableBetaRequestProps {
  id: string
  data: Object
}

export interface SerializedUnserializableBetaRequestProps {
  createdAt: string
  updatedAt: string
  requester: SerializableUserTeamPermissionsProps
}

export type SerializedBetaRequest = SerializedUnserializableBetaRequestProps &
  SerializableBetaRequestProps
