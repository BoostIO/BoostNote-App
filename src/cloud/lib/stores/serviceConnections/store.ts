import { SerializedServiceConnection } from '../../../interfaces/db/connections'
import { useEffectOnce } from 'react-use'
import {
  getUserServiceConnections,
  deleteUserServiceConnection,
} from '../../../api/connections'
import { useState, useRef, useCallback } from 'react'
import { useToast } from '../toast'

interface Actions {
  removeConnection: (
    serviceConnection: SerializedServiceConnection
  ) => Promise<void>
  addConnection: (serviceConnection: SerializedServiceConnection) => void
}

export type State =
  | { type: 'initialising' }
  | {
      type: 'working'
      connections: SerializedServiceConnection[]
      actions: Actions
    }
  | {
      type: 'initialised'
      connections: SerializedServiceConnection[]
      actions: Actions
    }

export function useServiceConnectionsStore(): State {
  const { pushApiErrorMessage } = useToast()
  const [connections, setConnections] = useState<SerializedServiceConnection[]>(
    []
  )
  const initialise = useRef(false)
  const [isLoadingConnections, setIsLoadingConnections] = useState(true)

  useEffectOnce(() => {
    const getServiceConnections = async () => {
      try {
        const { connections } = await getUserServiceConnections()
        setConnections(connections)
        initialise.current = true
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setIsLoadingConnections(false)
      }
    }
    getServiceConnections()
  })

  const removeConnection = useCallback(
    async (connection: SerializedServiceConnection) => {
      try {
        setIsLoadingConnections(true)
        await deleteUserServiceConnection(connection)
        setConnections((conns) => {
          return conns.filter((conn) => conn.id !== connection.id)
        })
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setIsLoadingConnections(false)
      }
    },
    [pushApiErrorMessage]
  )

  const addConnection = useCallback(
    (connection: SerializedServiceConnection) => {
      setConnections((prevConns) => [connection, ...prevConns])
    },
    []
  )

  if (!initialise.current) {
    return { type: 'initialising' }
  }

  return {
    type: isLoadingConnections ? 'working' : 'initialised',
    connections,
    actions: {
      addConnection,
      removeConnection,
    },
  }
}
