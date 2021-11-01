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
import {
  createCodemirrorTypeKeymap,
  defaultKeymap,
  findExistingShortcut,
  getMenuAcceleratorForKeymapItem,
  isMenuKeymap,
  KeymapItem,
  KeymapItemEditableProps,
} from '../../../../lib/keymap'
import { useElectron } from '../electron'

const basePreferences: Preferences = {
  folderSortingOrder: 'Latest Updated',
  docContextMode: 'comment',
  sidebarIsHidden: false,
  sidebarIsHovered: false,
  sidebarTreeSortingOrder: 'drag',
  sideBarWidth: 250,
  lastEditorMode: 'edit',
  lastEditorEditLayout: 'split',
  workspaceManagerIsOpen: true,
  lastSidebarState: 'tree',
  docStatusDisplayed: ['in_progress', 'paused'],
  sidebarOrderedCategories: cloudSidebaCategoryLabels.join(
    cloudSidebarOrderedCategoriesDelimiter
  ),
  version: 1,
  docPropertiesAreHidden: false,
  keymap: new Map<string, KeymapItem>(),
}

function replacer(_key: string, value: any) {
  if (value instanceof Map && value.size > 0) {
    return {
      dataType: 'Map',
      value: [...value.entries()],
    }
  } else {
    return value
  }
}

function reviver(_key: string, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value)
    }
  }
  return value
}

function savePreferencesToLocalStorage(preferences: Partial<Preferences>) {
  localLiteStorage.setItem(
    preferencesKey,
    JSON.stringify(preferences, replacer)
  )
}

function getExistingPreferences() {
  try {
    const stringifiedPreferences = localLiteStorage.getItem(preferencesKey)
    if (stringifiedPreferences == null) return
    const existingPreferences = JSON.parse(stringifiedPreferences, reviver)
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
  const { sendToElectron, usingElectron } = useElectron()
  const hoverOffTimeoutRef = useRef<number>()

  const mergedPreferences = useMemo(() => {
    const preferencesKeymap = preferences['keymap']
    const keymap = basePreferences['keymap']
    try {
      if (preferencesKeymap != null) {
        preferencesKeymap.forEach((value, key) => {
          keymap.set(key, value)
        })
      }
    } catch (e) {
      console.warn('Corrupted storage, preferences keymap was null!')
    }
    return {
      ...basePreferences,
      ...preferences,
      keymap: keymap,
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

  const keymap = mergedPreferences['keymap']
  const getAcceleratorTypeKeymap = useCallback(
    (key: string) => {
      if (keymap == null) {
        return ''
      }
      const keymapItem = keymap.get(key)
      if (keymapItem == null) {
        return ''
      }
      return getMenuAcceleratorForKeymapItem(keymapItem)
    },
    [keymap]
  )

  const getCodemirrorTypeKeymap = useCallback(
    (key: string) => {
      if (keymap == null) {
        return null
      }
      const keymapItem = keymap.get(key)
      if (keymapItem == null || keymapItem.shortcutMainStroke == null) {
        return null
      }
      let keymapString = createCodemirrorTypeKeymap(
        keymapItem.shortcutMainStroke
      )
      if (keymapItem.shortcutSecondStroke != null) {
        keymapString +=
          ' ' + createCodemirrorTypeKeymap(keymapItem.shortcutSecondStroke)
      }
      return keymapString
    },
    [keymap]
  )

  const updateKeymap = useCallback(
    (
      key: string,
      firstShortcut: KeymapItemEditableProps,
      secondShortcut?: KeymapItemEditableProps
    ): Promise<void> => {
      if (keymap == null) {
        return Promise.reject('No keymap available')
      }
      if (findExistingShortcut(key, firstShortcut, keymap)) {
        return Promise.reject('Existing keymap with the same shortcut')
      }
      const keymapItem = keymap.get(key)
      if (keymapItem == null) {
        return Promise.reject(`No such keymap to set for key: ${key}`)
      }
      keymap.set(key, {
        description: keymapItem.description,
        isMenuType: keymapItem.isMenuType,
        shortcutMainStroke: {
          ...keymapItem.shortcutMainStroke,
          ...firstShortcut,
        },
        shortcutSecondStroke:
          secondShortcut != null
            ? {
                ...keymapItem.shortcutSecondStroke,
                ...secondShortcut,
              }
            : undefined,
      })

      setPreferences((preferences) => {
        return {
          ...preferences,
          keymap: keymap,
        }
      })

      if (isMenuKeymap(keymapItem)) {
        if (usingElectron) {
          sendToElectron('menuAcceleratorChanged', [
            key,
            getMenuAcceleratorForKeymapItem(keymapItem),
          ])
        }
      }
      return Promise.resolve()
    },
    [keymap, sendToElectron, setPreferences, usingElectron]
  )

  const removeKeymap = useCallback(
    (key) => {
      if (keymap == null) {
        return false
      }
      const keymapItem = keymap.get(key)
      if (keymapItem == null) {
        return false
      }
      keymap.set(key, {
        ...keymapItem,
        shortcutMainStroke: undefined,
        shortcutSecondStroke: undefined,
      })
      setPreferences((preferences) => {
        return {
          ...preferences,
          keymap: keymap,
        }
      })

      if (isMenuKeymap(keymapItem)) {
        if (usingElectron) {
          sendToElectron('menuAcceleratorChanged', [key, null])
        }
      }
      return true
    },
    [keymap, sendToElectron, setPreferences, usingElectron]
  )

  const loadKeymaps = useCallback(() => {
    const keymap = mergedPreferences['keymap']
    for (const [key, keymapItem] of keymap) {
      if (isMenuKeymap(keymapItem)) {
        if (usingElectron) {
          sendToElectron('menuAcceleratorChanged', [
            key,
            getMenuAcceleratorForKeymapItem(keymapItem),
          ])
        }
      }
    }

    // add new keymaps to preferences if weren't available before
    let addedKeymap = false
    for (const [key, keymapItem] of defaultKeymap) {
      if (!keymap.has(key)) {
        keymap.set(key, keymapItem)
        addedKeymap = true
      }
    }
    if (addedKeymap) {
      setPreferences((preferences) => {
        return {
          ...preferences,
          keymap: keymap,
        }
      })
    }
  }, [mergedPreferences, sendToElectron, setPreferences, usingElectron])

  const resetKeymap = useCallback(() => {
    keymap.clear()
    for (const [key, keymapItem] of defaultKeymap) {
      keymap.set(key, keymapItem)
    }
    setPreferences((preferences) => {
      return {
        ...preferences,
        keymap: defaultKeymap,
      }
    })
  }, [keymap, setPreferences])

  useEffect(() => {
    loadKeymaps()
    savePreferencesToLocalStorage(preferences)
  }, [loadKeymaps, mergedPreferences, preferences, resetKeymap])

  return {
    preferences: mergedPreferences,
    setPreferences,
    toggleHideSidebar,
    hoverSidebarOff,
    hoverSidebarOn,
    topBarPaddingLeft,
    updateKeymap,
    removeKeymap,
    resetKeymap,
    getCodemirrorTypeKeymap,
    getAcceleratorTypeKeymap,
  }
}

export const {
  StoreProvider: PreferencesProvider,
  useStore: usePreferences,
} = createStoreContext(usePreferencesStore, 'preferences')
