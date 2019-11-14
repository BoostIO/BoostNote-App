import { useMemo, useEffect } from 'react'
import { localLiteStorage } from 'ltstrg'
import { useSetState } from 'react-use'
import { generalStatusKey } from '../localStorageKeys'
import { createStoreContext } from '../utils/context'
import { GeneralStatus } from './types'

function loadGeneralStatus(): Partial<GeneralStatus> {
  const stringifiedGeneralStatus = localLiteStorage.getItem(generalStatusKey)
  if (stringifiedGeneralStatus == null) return {}
  try {
    return JSON.parse(stringifiedGeneralStatus)
  } catch (error) {
    console.warn('Failed to load general status')
    console.warn(error.message)
    return {}
  }
}

function saveGeneralStatus(generalStatus: Partial<GeneralStatus>) {
  localLiteStorage.setItem(generalStatusKey, JSON.stringify(generalStatus))
}

const initialGeneralStatus = loadGeneralStatus()

const baseGeneralStatus: GeneralStatus = {
  sideBarWidth: 160,
  noteListWidth: 250,
  noteEditMode: 'split'
}

function useGeneralStatusStore() {
  const [generalStatus, setGeneralStatus] = useSetState<Partial<GeneralStatus>>(
    initialGeneralStatus
  )

  const mergedGeneralStatus = useMemo(() => {
    return {
      ...baseGeneralStatus,
      ...generalStatus
    }
  }, [generalStatus])

  useEffect(() => {
    saveGeneralStatus(generalStatus)
  }, [generalStatus])

  return {
    generalStatus: mergedGeneralStatus,
    setGeneralStatus
  }
}

export const {
  StoreProvider: GeneralStatusProvider,
  useStore: useGeneralStatus
} = createStoreContext(useGeneralStatusStore, 'generalStatus')
