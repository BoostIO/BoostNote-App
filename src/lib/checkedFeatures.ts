import { useState, useCallback, useEffect } from 'react'
import { localLiteStorage } from 'ltstrg'
import { checkedFeaturesKey, appModeChosenKey } from './localStorageKeys'
import { createStoreContext } from './context'

export const featureBoostHubIntro = 'boostHubIntro'
export const featureBoostHubSignIn = 'boostHubSignIn'
export const featureAppModeSelect = 'boostNoteAppModeSelect'

function loadCheckedFeatures(): string[] {
  const stringifiedCheckedFeatures = localLiteStorage.getItem(
    checkedFeaturesKey
  )
  if (stringifiedCheckedFeatures == null) return []
  try {
    const checkedFeatures = JSON.parse(stringifiedCheckedFeatures) as string[]

    const legacyAppModeChosenFlag = localLiteStorage.getItem(appModeChosenKey)
    if (legacyAppModeChosenFlag != null) {
      checkedFeatures.push(featureAppModeSelect)
      localLiteStorage.removeItem(appModeChosenKey)
    }
    return checkedFeatures
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
