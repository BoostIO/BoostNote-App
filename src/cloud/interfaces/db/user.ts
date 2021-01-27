import { SerializedIcon } from './icon'
import { SerializedUserTeamPermissions } from './userTeamPermissions'

export interface SerializableUserProps {
  id: string
  uniqueName: string
  displayName: string
  icon?: SerializedIcon
}

export interface SerializedUnserializableUserProps {
  permissions?: SerializedUserTeamPermissions[]
  createdAt: string
  updatedAt: string
}

export type SerializedUser = SerializedUnserializableUserProps &
  SerializableUserProps

export interface UserOnboardingState {
  trialAnnouncement?: boolean
}
