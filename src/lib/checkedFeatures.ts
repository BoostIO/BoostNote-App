import { useState, useCallback, useEffect } from 'react'
import { localLiteStorage } from 'ltstrg'
import { checkedFeaturesKey } from './localStorageKeys'
import { createStoreContext } from './context'

export const featureBoostHubSignIn = 'boostHubSignIn'

function loadCheckedFeatures(): string[] {
  const stringifiedGeneralStatus = localLiteStorage.getItem(checkedFeaturesKey)
  if (stringifiedGeneralStatus == null) return []
  try {
    return JSON.parse(stringifiedGeneralStatus)
  } catch (error) {
    console.warn('Failed to load checked features')
    console.warn(error.message)
    return []
  }
}

function saveCheckedFeatures(checkedFeatures: Set<string>) {
  localLiteStorage.setItem(
    checkedFeaturesKey,
    JSON.stringify([...checkedFeatures])
  )
}

const initialCheckedFeaturesSet = new Set(loadCheckedFeatures())

function useCheckedFeaturesStore() {
  const [checkedFeaturesSet, setCheckedFeaturesSet] = useState(
    initialCheckedFeaturesSet
  )

  const checkFeature = useCallback((feature: string) => {
    setCheckedFeaturesSet((previousSet) => {
      if (previousSet.has(feature)) {
        return previousSet
      }
      const newSet = new Set(previousSet)
      newSet.add(feature)
      return newSet
    })
  }, [])

  const isChecked = useCallback(
    (feature: string) => {
      return checkedFeaturesSet.has(feature)
    },
    [checkedFeaturesSet]
  )

  useEffect(() => {
    saveCheckedFeatures(checkedFeaturesSet)
  }, [checkedFeaturesSet])

  return {
    checkFeature,
    isChecked,
  }
}

export const {
  StoreProvider: CheckedFeaturesProvider,
  useStore: useCheckedFeatures,
} = createStoreContext(useCheckedFeaturesStore, 'checkedFeaturesStore')
