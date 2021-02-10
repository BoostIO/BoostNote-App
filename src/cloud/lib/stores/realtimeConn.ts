import { createStoreContext } from '../utils/context'
import { useRef, useState, useCallback } from 'react'
import { makeConstructor, MultiplexConnection } from '../realtime/client'
import { useEffectOnce } from 'react-use'

function useRealtimeConnStore() {
  const multiplexerRef = useRef<[(token: string) => WebSocket, () => void]>()
  const [constructor, setConstructor] = useState<typeof WebSocket | null>(null)
  const currentUrl = useRef('')

  useEffectOnce(() => {
    return () => {
      if (multiplexerRef.current != null) {
        multiplexerRef.current[1]()
      }
    }
  })

  const connect = useCallback((url: string, auth: string) => {
    if (currentUrl.current === url) {
      return
    }

    currentUrl.current = url

    if (multiplexerRef.current != null) {
      multiplexerRef.current[1]()
    }

    multiplexerRef.current = MultiplexConnection({ auth, url })
    setConstructor(() => {
      return multiplexerRef.current != null
        ? makeConstructor(multiplexerRef.current[0])
        : null
    })
  }, [])

  return {
    connect,
    constructor,
  }
}

export const {
  StoreProvider: RealtimeConnProvider,
  useStore: useRealtimeConn,
} = createStoreContext(useRealtimeConnStore, 'realtimeConn')
