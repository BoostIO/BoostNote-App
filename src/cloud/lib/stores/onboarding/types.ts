import { UserOnboardingState } from '../../../interfaces/db/user'

export interface OnboardingContext {
  currentOnboardingState?: UserOnboardingState
  setOnboarding: (val: Partial<UserOnboardingState>) => void
}
