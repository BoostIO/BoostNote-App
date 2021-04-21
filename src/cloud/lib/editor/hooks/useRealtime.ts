import { useEffect, useState, useRef } from 'react'
import { Doc, applyUpdate, encodeStateAsUpdate } from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { uniqWith } from 'ramda'
import { useRealtimeConn } from '../../stores/realtimeConn'
import { createCache } from '../../cache'
import { useEffectOnce } from 'react-use'

export type PresenceChange<T> =
  | { type: 'connected'; sessionId: number; userInfo: T }
  | { type: 'disconnected'; sessionId: number }

export interface RealtimeArgs<T extends { id: string }> {
  token: string
  id: string
  userInfo?: T
}

export type ConnectionState =
  | 'initialising'
  | 'loaded'
  | 'connected'
  | 'synced'
  | 'reconnecting'
  | 'disconnected'

const RETRY_TIMEOUT = 30000

const useRealtime = <T extends { id: string }>({
  token,
  id,
  userInfo,
}: RealtimeArgs<T>) => {
  const { constructor } = useRealtimeConn()
  const [provider, setProvider] = useState<WebsocketProvider | undefined>()
  const [connState, setConnState] = useState<ConnectionState>('initialising')
  const [users, setUsers] = useState<T[]>([])
  const timeoutRef = useRef<number>()
  const [cachePromise] = useState(() =>
    createCache<Uint8Array>('cache:realtime', { max_object_count: 1000 })
  )

  useEffect(() => {
    if (provider != null) {
      const setCache = () =>
        cachePromise
          .then((cache) => cache.put(id, encodeStateAsUpdate(provider.doc)))
          .catch((error) => console.log(error))

      window.addEventListener('beforeunload', setCache)
      return () => {
        window.removeEventListener('beforeunload', setCache)
      }
    }
    return undefined
  }, [provider, cachePromise, id])

  useEffectOnce(() => {
    return () => {
      cachePromise.then((cache) => cache.close())
    }
  })

  useEffect(() => {
    if (constructor == null) {
      return
    }

    const doc = new Doc()

    let cancel = false
    cachePromise
      .then((cache) => cache.get(id))
      .then((data) => {
        if (data != null && !cancel) {
          applyUpdate(doc, data)
          setConnState((current) => (current !== 'synced' ? 'loaded' : current))
        }
      })
      .catch((error) => console.error(error))

    const provider = new WebsocketProvider('', token, doc, {
      WebSocketPolyfill: constructor,
      resyncInterval: 10000,
    })

    provider.on('status', ({ status }: any) => {
      const connected = status === 'connected'
      setConnState(connected ? 'connected' : 'reconnecting')
      if (!connected && timeoutRef.current == null) {
        timeoutRef.current = window.setTimeout(() => {
          provider.disconnect()
          setConnState('disconnected')
        }, RETRY_TIMEOUT)
      }
      if (connected) {
        clearInterval(timeoutRef.current)
        timeoutRef.current = undefined
      }
    })

    provider.on('sync', (synced: boolean) => {
      setConnState((prev) => (synced ? 'synced' : prev))
    })

    provider.awareness.on('change', () => {
      const states: Map<number, any> = provider.awareness.getStates()
      const users = Array.from(states.values()).reduce((acc, curr) => {
        if (curr.user != null) {
          acc.push(curr.user)
        }
        return acc
      }, [])
      setUsers(() => uniqWith(idEq, users))
    })

    const origConnect = provider.connect
    provider.connect = () => {
      setConnState('reconnecting')
      clearInterval(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        provider.disconnect()
        setConnState('disconnected')
      }, RETRY_TIMEOUT)
      origConnect.call(provider)
    }

    setProvider(provider)
    return () => {
      cancel = true
      clearInterval(timeoutRef.current)
      doc.destroy()
      provider.awareness.destroy()
      provider.disconnect()
      provider.destroy()
      setUsers([])
      setConnState('disconnected')
      encodeStateAsUpdate(doc)
      cachePromise
        .then((cache) => cache.put(id, encodeStateAsUpdate(doc)))
        .catch((error) => console.log(error))
    }
  }, [token, constructor, cachePromise, id])

  useEffect(() => {
    if (provider != null && userInfo != null) {
      provider.awareness.setLocalStateField('user', userInfo)
    }
  }, [userInfo, provider])

  return [provider, connState, users] as [
    WebsocketProvider,
    ConnectionState,
    T[]
  ]
}

const idEq = <T extends { id: string }>(x: T, y: T) => x.id === y.id

export default useRealtime
