import { useMemo, useCallback } from 'react'
import { createStoreContext } from '../../utils/context'
import { OnboardingContext } from './types'
import { useGlobalData } from '../globalData'
import { UserOnboardingState } from '../../../interfaces/db/user'
import { updateUserOnboardingProgress } from '../../../api/users/onboarding'
export * from './types'

const baseUserOnboarding: UserOnboardingState = {}

function useOnboardingStore(): OnboardingContext {
  const { globalData, setPartialGlobalData } = useGlobalData()
  const { currentUserOnboarding, currentUser } = globalData

  const currentOnboardingState = useMemo(() => {
    if (currentUser == null) {
      return undefined
    }

    if (currentUserOnboarding == null) {
      return baseUserOnboarding
    }

    return {
      ...baseUserOnboarding,
      ...currentUserOnboarding,
    }
  }, [currentUserOnboarding, currentUser])

  const setOnboarding = useCallback(
    async (data: Partial<UserOnboardingState>) => {
      setPartialGlobalData({
        currentUserOnboarding: {
          ...baseUserOnboarding,
          ...currentUserOnboarding,
          ...data,
        },
      })
      try {
        await updateUserOnboardingProgress({ ...data })
      } catch (error) {}
    },
    [currentUserOnboarding, setPartialGlobalData]
  )

  return {
    currentOnboardingState,
    setOnboarding,
  }
}

export const {
  StoreProvider: OnboardingProvider,
  useStore: useOnboarding,
} = createStoreContext(useOnboardingStore, 'onboarding')
