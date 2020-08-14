import { useMemo, useCallback, useEffect } from 'react'
import { localLiteStorage } from 'ltstrg'
import { useSetState } from 'react-use'
import { generalStatusKey } from './localStorageKeys'
import { createStoreContext } from './context'
import { getFolderItemId, getStorageItemId } from './nav'

export type ViewModeType = 'edit' | 'preview' | 'split'

export type FeatureType =
  | 'createNote'
  | 'createFolder'
  | 'changeAppTheme'
  | 'changeEditorTheme'
  | 'checkOutMobileApp'

export interface GeneralStatus {
  sideBarWidth: number
  noteListWidth: number
  noteViewMode: ViewModeType
  sideNavOpenedItemList: string[]
  checkedFeatures: FeatureType[]
  hiddenCheckedFeatures: boolean
}

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
  noteViewMode: 'edit',
  sideNavOpenedItemList: [],
  checkedFeatures: [],
  hiddenCheckedFeatures: false,
}

function useGeneralStatusStore() {
  const [generalStatus, setGeneralStatus] = useSetState<Partial<GeneralStatus>>(
    initialGeneralStatus
  )

  const mergedGeneralStatus = useMemo(() => {
    return {
      ...baseGeneralStatus,
      ...generalStatus,
    }
  }, [generalStatus])

  const { sideNavOpenedItemList, checkedFeatures } = mergedGeneralStatus
  const sideNavOpenedItemSet = useMemo(() => {
    return new Set(sideNavOpenedItemList)
  }, [sideNavOpenedItemList])

  const toggleSideNavOpenedItem = useCallback(
    (itemId: string) => {
      const newSet = new Set(sideNavOpenedItemSet)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      setGeneralStatus({
        sideNavOpenedItemList: [...newSet],
      })
    },
    [setGeneralStatus, sideNavOpenedItemSet]
  )

  const addSideNavOpenedItem = useCallback(
    (...itemIdList: string[]) => {
      const newSet = new Set(sideNavOpenedItemSet)

      for (const itemId of itemIdList) {
        newSet.add(itemId)
      }

      setGeneralStatus({
        sideNavOpenedItemList: [...newSet],
      })
    },
    [setGeneralStatus, sideNavOpenedItemSet]
  )

  const openSideNavFolderItemRecursively = useCallback(
    (storageId: string, folderPathname: string) => {
      const folderPathElements = folderPathname.slice(1).split('/')
      const itemIdListToOpen = []
      let currentPathname = ''
      itemIdListToOpen.push(getStorageItemId(storageId))
      for (const element of folderPathElements) {
        currentPathname = `${currentPathname}/${element}`
        itemIdListToOpen.push(getFolderItemId(storageId, currentPathname))
      }

      addSideNavOpenedItem(...itemIdListToOpen)
    },
    [addSideNavOpenedItem]
  )

  const checkFeature = useCallback(
    (featureName: FeatureType) => {
      const checkedFeatureSet = new Set(checkedFeatures)
      if (checkedFeatureSet.has(featureName)) {
        return
      }
      checkedFeatureSet.add(featureName)
      setGeneralStatus({
        checkedFeatures: [...checkedFeatureSet],
      })
    },
    [checkedFeatures, setGeneralStatus]
  )

  const hideFeatureCheckList = useCallback(() => {
    setGeneralStatus({
      hiddenCheckedFeatures: true,
    })
  }, [setGeneralStatus])

  useEffect(() => {
    saveGeneralStatus(generalStatus)
  }, [generalStatus])

  return {
    generalStatus: mergedGeneralStatus,
    setGeneralStatus,
    sideNavOpenedItemSet,
    toggleSideNavOpenedItem,
    addSideNavOpenedItem,
    openSideNavFolderItemRecursively,
    checkFeature,
    hideFeatureCheckList,
  }
}

export const {
  StoreProvider: GeneralStatusProvider,
  useStore: useGeneralStatus,
} = createStoreContext(useGeneralStatusStore, 'generalStatus')
