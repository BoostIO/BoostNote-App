import { SerializedUserTeamPermissions } from './userTeamPermissions'
import { SerializedIcon } from './icon'
import { SerializedSubscription } from './subscription'

export interface SerializableTeamProps {
  id: string
  domain: string
  name: string
  version: number
  trial: boolean
  creationsCounter: number
  icon?: SerializedIcon
  state: TeamOnboardingState
  personal: boolean
  discountId?: string
}

export interface SerializedUnserializableTeamProps {
  subscription?: SerializedSubscription
  permissions: SerializedUserTeamPermissions[]
  createdAt: string
  updatedAt: string
}

export type SerializedTeam = SerializedUnserializableTeamProps &
  SerializableTeamProps

export interface TeamOnboardingState {
  import?: boolean
  settings?: boolean
}
