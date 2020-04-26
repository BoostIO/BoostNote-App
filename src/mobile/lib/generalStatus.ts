import { useMemo, useCallback, useEffect } from 'react'
import { localLiteStorage } from 'ltstrg'
import { useSetState } from 'react-use'
import { generalStatusKey } from '../../lib/localStorageKeys'
import { createStoreContext } from '../../lib/context'
import { getFolderItemId, getStorageItemId } from '../../lib/nav'

export type ViewModeType = 'edit' | 'preview'

export interface GeneralStatus {
  navIsOpen: boolean
  noteViewMode: ViewModeType
  navOpenedItemList: string[]
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
  navIsOpen: false,
  noteViewMode: 'edit',
  navOpenedItemList: [],
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

  const toggleNav = useCallback(() => {
    setGeneralStatus((generalStatus) => {
      return {
        ...generalStatus,
        navIsOpen: !generalStatus.navIsOpen,
      }
    })
  }, [setGeneralStatus])

  const { navOpenedItemList: sideNavOpenedItemList } = mergedGeneralStatus
  const sideNavOpenedItemSet = useMemo(() => {
    return new Set(sideNavOpenedItemList)
  }, [sideNavOpenedItemList])

  const toggleNavOpenedItem = useCallback(
    (itemId: string) => {
      const newSet = new Set(sideNavOpenedItemSet)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      setGeneralStatus({
        navOpenedItemList: [...newSet],
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
        navOpenedItemList: [...newSet],
      })
    },
    [setGeneralStatus, sideNavOpenedItemSet]
  )

  const openSideNavFolderItemRecursively = useCallback(
    (storageId: string, folderPathname: string) => {
      const folderPathElements = folderPathname.slice(1).split('/')
      const itemIdListToOpen = []
      let currentPathname = ''
      for (const element of folderPathElements) {
        currentPathname = `${currentPathname}/${element}`
        itemIdListToOpen.push(getFolderItemId(storageId, currentPathname))
      }

      addSideNavOpenedItem(getStorageItemId(storageId), ...itemIdListToOpen)
    },
    [addSideNavOpenedItem]
  )

  useEffect(() => {
    saveGeneralStatus(generalStatus)
  }, [generalStatus])

  return {
    generalStatus: mergedGeneralStatus,
    setGeneralStatus,
    sideNavOpenedItemSet,
    toggleSideNavOpenedItem: toggleNavOpenedItem,
    addSideNavOpenedItem,
    openSideNavFolderItemRecursively,
    toggleNav,
  }
}

export const {
  StoreProvider: GeneralStatusProvider,
  useStore: useGeneralStatus,
} = createStoreContext(useGeneralStatusStore, 'generalStatus')
