import { useRef, useState, useEffect } from 'react'
import useApi from '../../../../design/lib/hooks/useApi'
import { getTeamBetaRegistration } from '../../../api/beta/registration'
import { SerializedBetaRegistration } from '../../../interfaces/db/beta'
import { usePage } from '../pageStore'

type BetaRegistrationState =
  | { state: 'loading' }
  | {
      state: 'loaded'
      betaRegistration?: SerializedBetaRegistration
    }

export function useBetaRegistrationStore(): BetaRegistrationState {
  const teamRef = useRef('')
  const { team } = usePage()
  const [betaRegistration, setBetaRegistration] =
    useState<SerializedBetaRegistration>()

  const { submit: getBetaRegistration, sending: fetching } = useApi({
    api: () => getTeamBetaRegistration(teamRef.current),
    cb: ({ data }) => {
      setBetaRegistration(data)
    },
  })

  useEffect(() => {
    if (team == null) {
      teamRef.current = ''
      setBetaRegistration(undefined)
      return
    }

    if (team.id !== teamRef.current) {
      teamRef.current = team.id
      getBetaRegistration()
    }
  }, [getBetaRegistration, team])

  if (fetching) {
    return { state: 'loading' }
  }

  return {
    state: 'loaded',
    betaRegistration,
  }
}
