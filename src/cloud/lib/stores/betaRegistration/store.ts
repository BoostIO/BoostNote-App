import { useState } from 'react'
import { useEffectOnce } from 'react-use'
import useApi from '../../../../shared/lib/hooks/useApi'
import { getUserBetaRegistration, registerToBeta } from '../../../api/beta'

type BetaRegistrationState =
  | { state: 'loading' }
  | {
      state: 'loaded'
      betaRegistration: any
      registration: {
        registering: boolean
        register: (teamId?: string) => void
      }
    }

export function useBetaRegistrationStore(): BetaRegistrationState {
  const [betaRegistration, setBetaRegistration] = useState<any>()

  const { submit: getBetaRegistration, sending: fetching } = useApi({
    api: () => getUserBetaRegistration(),
    cb: ({ betaRegistration }) => {
      setBetaRegistration(betaRegistration)
    },
  })

  const { submit: register, sending: registering } = useApi({
    api: (teamId?: string) => registerToBeta(teamId),
    cb: ({ betaRegistration }) => {
      setBetaRegistration(betaRegistration)
    },
  })

  useEffectOnce(() => {
    getBetaRegistration()
  })

  if (fetching) {
    return { state: 'loading' }
  }

  return {
    state: 'loaded',
    betaRegistration,
    registration: {
      registering,
      register: register,
    },
  }
}
