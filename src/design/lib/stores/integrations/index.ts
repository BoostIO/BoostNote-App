import { createStoreContext } from '../../utils/context'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { SerializedTeamIntegration } from '../../../../cloud/interfaces/db/connections'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useToast } from '../toast'
import {
  getTeamIntegrations,
  deleteTeamIntegration,
} from '../../../../cloud/api/integrations'

interface Actions {
  removeIntegration: (
    serviceConnection: SerializedTeamIntegration
  ) => Promise<void>
  addIntegration: (serviceConnection: SerializedTeamIntegration) => void
}

export type State =
  | { type: 'initialising'; actions: Actions }
  | {
      type: 'working'
      integrations: SerializedTeamIntegration[]
      actions: Actions
    }
  | {
      type: 'initialised'
      integrations: SerializedTeamIntegration[]
      actions: Actions
    }

function useTeamIntegrationsStore(): State {
  const { team, currentUserPermissions } = usePage()
  const { pushApiErrorMessage } = useToast()
  const [integrations, setIntegrations] = useState<SerializedTeamIntegration[]>(
    []
  )
  const [loadingState, setLoadingState] = useState<
    'initialising' | 'working' | 'initialised'
  >('initialising')

  const prevTeamRef = useRef('')
  const prevUserRef = useRef('')
  useEffect(() => {
    if (team == null || currentUserPermissions == null) {
      setLoadingState('initialising')
      setIntegrations([])
      return undefined
    }

    if (
      team.id === prevTeamRef.current &&
      currentUserPermissions.user.id === prevUserRef.current
    ) {
      return undefined
    }

    setLoadingState('initialising')
    setIntegrations([])
    prevTeamRef.current = team.id
    prevUserRef.current = currentUserPermissions.user.id

    let cancel = false
    const getIntegrations = async () => {
      try {
        const { integrations } = await getTeamIntegrations(team.id)
        if (cancel) {
          return
        }
        setIntegrations(integrations)
        setLoadingState('initialised')
      } catch (err) {
        pushApiErrorMessage(err)
      }
    }

    getIntegrations()
    return () => {
      cancel = true
    }
  }, [team, currentUserPermissions, pushApiErrorMessage])

  const removeIntegration = useCallback(
    async (connection: SerializedTeamIntegration) => {
      try {
        setLoadingState('working')
        await deleteTeamIntegration(connection)
        setIntegrations((conns) => {
          return conns.filter((conn) => conn.id !== connection.id)
        })
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setLoadingState('initialised')
      }
    },
    [pushApiErrorMessage]
  )

  const addIntegration = useCallback(
    (connection: SerializedTeamIntegration) => {
      setIntegrations((prev) => [connection, ...prev])
    },
    []
  )

  if (loadingState === 'initialising') {
    return { type: 'initialising' }
  }

  return {
    type: loadingState,
    integrations,
    actions: {
      addIntegration,
      removeIntegration,
    },
  }
}

export const {
  StoreProvider: TeamIntegrationsProvider,
  useStore: useTeamIntegrations,
} = createStoreContext(useTeamIntegrationsStore, 'Team Integrations')
