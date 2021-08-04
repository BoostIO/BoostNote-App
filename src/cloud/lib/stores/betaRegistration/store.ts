import { useState } from 'react'
import { useEffectOnce } from 'react-use'
import useApi from '../../../../shared/lib/hooks/useApi'
import {
  getUserBetaRegistration,
  registerToBeta,
  updateBetaRegistration,
} from '../../../api/beta'
import { SerializedBetaRegistration } from '../../../interfaces/db/betaRegistration'

type BetaRegistrationState =
  | { state: 'loading' }
  | {
      state: 'loaded'
      betaRegistration?: SerializedBetaRegistration
      registration: {
        registering: boolean
        register: (teamId?: string) => void
        updating: boolean
        update: (props: {
          betaRegistrationId: string
          integrations: string[]
        }) => void
      }
    }

export function useBetaRegistrationStore(): BetaRegistrationState {
  const [betaRegistration, setBetaRegistration] = useState<
    SerializedBetaRegistration
  >()

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

  const { submit: sendIntegrations, sending: updating } = useApi({
    api: ({
      betaRegistrationId,
      integrations,
    }: {
      betaRegistrationId: string
      integrations: string[]
    }) => updateBetaRegistration(betaRegistrationId, integrations),
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
      update: sendIntegrations,
      updating,
    },
  }
}
