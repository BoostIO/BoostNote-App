import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createGlobalState } from 'react-use'
import { useToast } from '../../../../design/lib/stores/toast'
import {
  createStatus,
  deleteStatus,
  listStatuses,
  StatusCreateRequestBody,
  StatusUpdateRequestBody,
  updateStatus,
} from '../../../api/status'
import { SerializedStatus } from '../../../interfaces/db/status'

interface State {
  statuses: SerializedStatus[]
  isWorking: boolean
}

const useStatusCache = createGlobalState<Cache>(createCache())

export function useStatuses(team: string) {
  const { pushApiErrorMessage } = useToast()
  const [cache, setCache] = useStatusCache()
  const [workingCount, setWorkingCount] = useState(0)

  const cacheRef = useRef(cache)
  useEffect(() => {
    cacheRef.current = cache
  }, [cache])
  const setCacheRef = useRef(setCache)
  useEffect(() => {
    setCacheRef.current = setCache
  }, [setCache])

  const setCacheDispatchRef = useRef((fn: (cache: Cache) => Cache) => {
    setCacheRef.current(fn(cacheRef.current || createCache()))
  })

  const errHandler = useRef(pushApiErrorMessage)
  useEffect(() => {
    errHandler.current = pushApiErrorMessage
  }, [pushApiErrorMessage])

  useEffect(() => {
    const refreshCache = async () => {
      try {
        setWorkingCount(increment)
        const statuses = await listStatuses({ team })
        setCacheDispatchRef.current(addToCache(statuses))
      } catch (err) {
        errHandler.current(err)
      } finally {
        setWorkingCount(decrement)
      }
    }
    refreshCache()
  }, [team])

  const state: State = useMemo(() => {
    const isWorking = workingCount > 0
    if (cache == null) {
      return { statuses: [], isWorking }
    }
    const statuses = cache.get(team) || new Map()
    return { statuses: Array.from(statuses.values()), isWorking }
  }, [cache, team, workingCount])

  const addStatus = useCallback(async (data: StatusCreateRequestBody) => {
    try {
      setWorkingCount(increment)
      const newStatus = await createStatus(data)
      setCacheDispatchRef.current(addToCache([newStatus]))
      return newStatus
    } catch (err) {
      errHandler.current(err)
      return null
    } finally {
      setWorkingCount(decrement)
    }
  }, [])

  const removeStatus = useCallback(async (data: SerializedStatus) => {
    try {
      setWorkingCount(increment)
      await deleteStatus(data.id)
      setCacheDispatchRef.current(removeFromCache([data]))
    } catch (err) {
      errHandler.current(err)
    } finally {
      setWorkingCount(decrement)
    }
  }, [])

  const editStatus = useCallback(async (data: StatusUpdateRequestBody) => {
    try {
      setWorkingCount(increment)
      const status = await updateStatus(data)
      setCacheDispatchRef.current(addToCache([status]))
      return status
    } catch (err) {
      errHandler.current(err)
      return null
    } finally {
      setWorkingCount(decrement)
    }
  }, [])

  return { state, addStatus, removeStatus, editStatus }
}

function increment(n: number) {
  return n + 1
}

function decrement(n: number) {
  return n > 0 ? n - 1 : 0
}

type Cache = Map<string, Map<number, SerializedStatus>>

function createCache() {
  return new Map()
}

function addToCache(statuses: SerializedStatus[]) {
  return (cache: Cache): Cache => {
    const newCache = new Map(cache)
    for (const status of statuses) {
      const map = newCache.get(status.teamId) || new Map()
      map.set(status.id, status)
      newCache.set(status.teamId, map)
    }
    return newCache
  }
}

function removeFromCache(statuses: SerializedStatus[]) {
  return (cache: Cache): Cache => {
    const newCache = new Map(cache)
    for (const status of statuses) {
      const map = newCache.get(status.teamId)
      if (map != null) {
        map.delete(status.id)
      }
    }
    return newCache
  }
}
