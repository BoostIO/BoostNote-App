import { createStoreContext } from '../../utils/context'
import { useState, useEffect, useCallback, SetStateAction } from 'react'
import { usePage } from '../pageStore'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedDoc } from '../../../interfaces/db/doc'
import { getExternalEntity } from '../../../api/teams/externalEntities'

export type Status = LoadingStatus | ErrorStatus | SuccessStatus

export interface LoadingStatus {
  type: 'loading'
}

export interface ErrorStatus {
  type: 'error'
  kind: ErrorKind
  originalError?: Error
  refreshing: boolean
}

export interface SuccessStatus {
  type: 'success'
  data: any
  refreshing: boolean
}

export type ErrorKind =
  | 'MissingIntegration'
  | 'NotFound'
  | 'Permission'
  | 'ServerError'

interface ExternalEntitiesStoreActions {
  getEntity: (type: string, id: string) => Status
  refreshEntity: (type: string, id: string) => void
  setEntity: (type: string, id: string, data: any) => void
  freeze: () => void
}

const useExternalEntitiesStore = (): ExternalEntitiesStoreActions => {
  const { team, pageDoc, pageData } = usePage()
  const [cacheFrozen, setCacheFrozen] = useState(false)
  const [currentTeam, setCurrentTeam] = useState<string | undefined>(
    getTeamFromPageProps(team, pageDoc, pageData)
  )
  const [cacheMap, setCacheMap] = useState(new Map<string, Status>())

  useEffect(() => {
    const newTeam = getTeamFromPageProps(team, pageDoc, pageData)
    if (newTeam !== currentTeam) {
      setCacheMap(new Map())
      setCurrentTeam(newTeam)
    }
  }, [team, pageDoc, currentTeam, pageData])

  const refreshEntity = useCallback(
    (type: string, id: string) => {
      if (currentTeam == null || cacheFrozen) {
        return
      }

      const cacheKey = `${type}:${id}`
      const cached = cacheMap.get(cacheKey)

      if (cached == null || cached.type === 'loading' || cached.refreshing) {
        return
      }

      loadExternalEntity(setCacheMap, cacheKey, currentTeam, type, id, true)

      setCacheMap((prev) => {
        prev.set(cacheKey, {
          ...cached,
          refreshing: true,
        })
        return new Map(prev)
      })
    },
    [cacheMap, currentTeam, cacheFrozen]
  )

  const getEntity = useCallback(
    (type: string, id: string): Status => {
      if (currentTeam == null) {
        return { type: 'error', kind: 'MissingIntegration', refreshing: false }
      }

      const cacheKey = `${type}:${id}`
      const cached = cacheMap.get(cacheKey)

      if (cached != null) {
        return cached
      }

      if (cacheFrozen) {
        return { type: 'error', kind: 'NotFound', refreshing: false }
      }

      const loadingStatus: LoadingStatus = { type: 'loading' }
      setCacheMap((prev) => {
        prev.set(cacheKey, loadingStatus)
        return new Map(prev)
      })

      loadExternalEntity(setCacheMap, cacheKey, currentTeam, type, id, false)

      return loadingStatus
    },
    [cacheMap, currentTeam, cacheFrozen]
  )

  const setEntity = useCallback((type: string, id: string, data: any) => {
    setCacheMap((prev) => {
      prev.set(`${type}:${id}`, { type: 'success', data, refreshing: false })
      return new Map(prev)
    })
  }, [])

  const freeze = useCallback(() => {
    setCacheFrozen(true)
  }, [])

  return { getEntity, refreshEntity, setEntity, freeze }
}

async function loadExternalEntity(
  setter: React.Dispatch<SetStateAction<Map<string, Status>>>,
  cacheKey: string,
  team: string,
  type: string,
  id: string,
  refresh: boolean
) {
  try {
    const data = await getExternalEntity(team, type, id, refresh)
    setter((prev) => {
      prev.set(cacheKey, { type: 'success', data, refreshing: false })
      return new Map(prev)
    })
  } catch (error) {
    setter((prev) => {
      prev.set(cacheKey, {
        type: 'error',
        kind: getErrorType(error),
        originalError: error,
        refreshing: false,
      })
      return new Map(prev)
    })
  }
}

function getErrorType(err: any): ErrorKind {
  if (err.response == null || err.response.status == null) {
    return 'ServerError'
  }

  switch (err.response.status) {
    case 401:
      return 'MissingIntegration'
    case 403:
      return 'Permission'
    case 404:
      return 'NotFound'
    default:
      return 'ServerError'
  }
}

function getTeamFromPageProps(
  team?: SerializedTeam,
  doc?: SerializedDoc,
  pageData?: any
) {
  if (team != null) {
    return team.id
  }

  if (doc != null) {
    return doc.teamId
  }

  if (pageData != null && pageData.doc != null) {
    return pageData.doc.teamId
  }

  return undefined
}

export const {
  StoreProvider: ExternalEntitiesProvider,
  useStore: useExternalEntities,
} = createStoreContext(useExternalEntitiesStore)
