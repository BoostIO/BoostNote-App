import { SerializedUser, UserOnboardingState } from './user'

export interface SerializableUserOnboardingProps {
  id: string
  state: UserOnboardingState
  version: number
}

export interface SerializedUnserializableUserOnboardingProps {
  user: SerializedUser
}

export type SerializedUserOnboarding = SerializedUnserializableUserOnboardingProps &
  SerializableUserOnboardingProps

export const userOnboardingBasicStepsStateKeys = [
  'createdFolder',
  'createdDocument',
  'invitedColleague',
  'changedPreferences',
]

export const userOnboardingNewFeaturesStateKeys = ['checkedShortKeyCheatsheet']

export const userOnboardingStateKeys = [
  ...userOnboardingBasicStepsStateKeys,
  ...userOnboardingNewFeaturesStateKeys,
]
