import { useCallback, useMemo, useEffect, useRef } from 'react'
import { createStoreContext } from '../../utils/context'
import { localLiteStorage } from 'ltstrg'
import { Preferences } from './types'
import { preferencesKey } from '../../localStorageKeys'
import { useSetState } from 'react-use'
import {
  cloudSidebaCategoryLabels,
  cloudSidebarOrderedCategoriesDelimiter,
} from '../../sidebar'

function savePreferencesToLocalStorage(preferences: Partial<Preferences>) {
  localLiteStorage.setItem(preferencesKey, JSON.stringify(preferences))
}

const basePreferences: Preferences = {
  folderSortingOrder: 'Latest Updated',
  docContextMode: 'context',
  sidebarIsHidden: false,
  sidebarIsHovered: false,
  sidebarTreeSortingOrder: 'last-updated',
  sideBarWidth: 250,
  lastEditorMode: 'edit',
  lastEditorEditLayout: 'split',
  workspaceManagerIsOpen: true,
  lastSidebarState: 'tree',
  sidebarOrderedCategories: cloudSidebaCategoryLabels.join(
    cloudSidebarOrderedCategoriesDelimiter
  ),
  version: 1,
}

function getExistingPreferences() {
  try {
    const stringifiedPreferences = localLiteStorage.getItem(preferencesKey)
    if (stringifiedPreferences == null) return
    const existingPreferences = JSON.parse(stringifiedPreferences)
    if (existingPreferences.version == null) {
      existingPreferences.version = 1

      const categories = existingPreferences.sidebarOrderedCategories.split(
        cloudSidebarOrderedCategoriesDelimiter
      ) as string[]
      if (categories[0] === 'Bookmarks') {
        categories.splice(1, 0, 'Smart Folders')
      } else {
        categories.splice(0, 0, 'Smart Folders')
      }
      console.info('Upgrade preferences from null to v1')

      existingPreferences.sidebarOrderedCategories = [...new Set(categories)]
        .filter((label) => label.length > 0)
        .join(cloudSidebarOrderedCategoriesDelimiter)
    }

    return existingPreferences
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(error.message)
  }
}

const initialPreference = {
  ...basePreferences,
  ...getExistingPreferences(),
}

function usePreferencesStore() {
  const [preferences, setPreferences] = useSetState<Partial<Preferences>>(
    initialPreference
  )
  const hoverOffTimeoutRef = useRef<number>()

  useEffect(() => {
    savePreferencesToLocalStorage(preferences)
  }, [preferences])

  const mergedPreferences = useMemo(() => {
    return {
      ...basePreferences,
      ...preferences,
    }
  }, [preferences])

  const toggleHideSidebar = useCallback(() => {
    setPreferences({
      sidebarIsHidden: !mergedPreferences.sidebarIsHidden,
      sidebarIsHovered: false,
    })
  }, [mergedPreferences, setPreferences])

  const topBarPaddingLeft = useMemo(() => {
    if (preferences.sidebarIsHidden || preferences.sideBarWidth == null) {
      return 0
    }

    return preferences.sideBarWidth
  }, [preferences.sideBarWidth, preferences.sidebarIsHidden])

  const hoverSidebarOff = useCallback(
    (time = 100) => {
      if (hoverOffTimeoutRef.current != null) {
        clearInterval(hoverOffTimeoutRef.current)
      }

      hoverOffTimeoutRef.current = window.setTimeout(() => {
        setPreferences({ sidebarIsHovered: false })
      }, time)
    },
    [setPreferences]
  )

  const hoverSidebarOn = useCallback(() => {
    if (hoverOffTimeoutRef.current != null) {
      clearInterval(hoverOffTimeoutRef.current)
    }

    setPreferences({ sidebarIsHovered: true })
  }, [setPreferences])

  return {
    preferences: mergedPreferences,
    setPreferences,
    toggleHideSidebar,
    hoverSidebarOff,
    hoverSidebarOn,
    topBarPaddingLeft,
  }
}

export const {
  StoreProvider: PreferencesProvider,
  useStore: usePreferences,
} = createStoreContext(usePreferencesStore, 'preferences')
