import { useCallback, useEffect, useMemo, useState } from 'react'
import { createStoreContext } from './context'
import { localLiteStorage } from 'ltstrg'
import { useSetState } from 'react-use'
import { useTranslation } from 'react-i18next'
import { preferencesKey } from './localStorageKeys'
import { NoteSortingOptions } from './sort'
import { sendIpcMessage } from './electronOnly'
import { nodeEnv } from '../cloud/lib/consts'
import { setAccessToken } from '../cloud/lib/stores/electron'
import {
  createCodemirrorTypeKeymap,
  defaultKeymap,
  findExistingShortcut,
  getMenuAcceleratorForKeymapItem,
  isMenuKeymap,
  KeymapItem,
  KeymapItemEditableProps,
} from './keymap'

export type GeneralThemeOptions =
  | 'auto'
  | 'light'
  | 'dark'
  | 'sepia'
  | 'solarizedDark'
export type GeneralLanguageOptions =
  | 'de'
  | 'en-US'
  | 'es-ES'
  | 'fr-FR'
  | 'it-IT'
  | 'ja'
  | 'ko'
  | 'pt-BR'
  | 'uk-UA'
  | 'zh-CN'
  | 'zh-HK'
  | 'zh-TW'
export type GeneralNoteListViewOptions = 'default' | 'compact'
export type EditorIndentTypeOptions = 'tab' | 'spaces'
export type EditorIndentSizeOptions = 2 | 4 | 8
export type EditorKeyMapOptions = 'default' | 'vim' | 'emacs'
export type EditorControlModeOptions = '2-toggles' | '3-buttons'
export type PreferencesTab =
  | 'about'
  | 'keymap'
  | 'editor'
  | 'markdown'
  | 'storage'
  | 'migration'
  | 'general'

export interface Preferences {
  // General
  'general.language': GeneralLanguageOptions
  'general.theme': GeneralThemeOptions
  'general.noteSorting': NoteSortingOptions
  'general.noteListView': GeneralNoteListViewOptions
  'general.enableAnalytics': boolean
  'general.showSubfolderContents': boolean

  // Cloud Workspace
  'cloud.user': {
    id: string
    uniqueName: string
    displayName: string
    accessToken: string
  } | null

  // Editor
  'editor.theme': string
  'editor.fontSize': number
  'editor.fontFamily': string
  'editor.indentType': EditorIndentTypeOptions
  'editor.indentSize': EditorIndentSizeOptions
  'editor.keyMap': EditorKeyMapOptions
  'editor.controlMode': EditorControlModeOptions

  // Markdown
  'markdown.previewStyle': string
  'markdown.codeBlockTheme': string
  'markdown.includeFrontMatter': boolean

  // Keymap
  'general.keymap': Map<string, KeymapItem>
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

function loadPreferences() {
  const stringifiedPreferences = localLiteStorage.getItem(preferencesKey)
  if (stringifiedPreferences == null) return {}
  try {
    return JSON.parse(stringifiedPreferences, reviver)
  } catch (error) {
    console.warn(error.message)
    return {}
  }
}

function savePreferences(preferences: Partial<Preferences>) {
  localLiteStorage.setItem(
    preferencesKey,
    JSON.stringify(preferences, replacer)
  )
}

const initialPreferences = loadPreferences()

const basePreferences: Preferences = {
  // General
  'general.language': 'en-US',
  'general.theme': 'dark',
  'general.noteSorting': 'updated-date-dsc',
  'general.enableAnalytics': true,
  'general.noteListView': 'default',
  'general.showSubfolderContents': true,

  // BoostHub
  'cloud.user': null,

  // Editor
  'editor.theme': 'material-darker',
  'editor.controlMode': '2-toggles',
  'editor.fontSize': 15,
  'editor.fontFamily':
    'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
  'editor.indentType': 'spaces',
  'editor.indentSize': 4,
  'editor.keyMap': 'default',

  // Markdown
  'markdown.previewStyle': 'default',
  'markdown.codeBlockTheme': 'material-darker',
  'markdown.includeFrontMatter': true,

  // Keymap
  'general.keymap': new Map<string, KeymapItem>(),
}

function usePreferencesStore() {
  const [preferences, setPreferences] = useSetState<Preferences>({
    ...initialPreferences,
  })

  const [tab, setSettingsTab] = useState<PreferencesTab>('about')

  const mergedPreferences = useMemo(() => {
    const preferencesKeymap = preferences['general.keymap']
    const keymap = basePreferences['general.keymap']
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
      'general.keymap': keymap,
    }
  }, [preferences])

  const [closed, setClosed] = useState(true)
  const togglePreferencesModal = useCallback(() => {
    if (closed) {
      setSettingsTab('about')
      setClosed(false)
    } else {
      setClosed(true)
    }
  }, [closed, setClosed])

  const openSettingsTab = useCallback(
    (tab: PreferencesTab) => {
      setSettingsTab(tab)
      if (closed) {
        setClosed(false)
      }
    },
    [closed]
  )

  const currentLanguage = mergedPreferences['general.language']
  if (nodeEnv !== 'test') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { i18n } = useTranslation('preferences')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      i18n.changeLanguage(currentLanguage)
    }, [i18n, currentLanguage])
  }

  const cloudUserInfo = preferences['cloud.user']
  useEffect(() => {
    if (cloudUserInfo == null) {
      setAccessToken(null)
      return
    }

    setAccessToken(cloudUserInfo.accessToken)
  }, [cloudUserInfo])

  const keymap = mergedPreferences['general.keymap']
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
          'general.keymap': keymap,
        }
      })

      if (isMenuKeymap(keymapItem)) {
        sendIpcMessage('menuAcceleratorChanged', [
          key,
          getMenuAcceleratorForKeymapItem(keymapItem),
        ])
      }
      return Promise.resolve()
    },
    [keymap, setPreferences]
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
          'general.keymap': keymap,
        }
      })

      if (isMenuKeymap(keymapItem)) {
        sendIpcMessage('menuAcceleratorChanged', [key, null])
      }
      return true
    },
    [keymap, setPreferences]
  )

  const loadKeymaps = useCallback(() => {
    const keymap = mergedPreferences['general.keymap']
    for (const [key, keymapItem] of keymap) {
      if (isMenuKeymap(keymapItem)) {
        sendIpcMessage('menuAcceleratorChanged', [
          key,
          getMenuAcceleratorForKeymapItem(keymapItem),
        ])
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
          'general.keymap': keymap,
        }
      })
    }
  }, [mergedPreferences, setPreferences])

  const resetKeymap = useCallback(() => {
    keymap.clear()
    for (const [key, keymapItem] of defaultKeymap) {
      keymap.set(key, keymapItem)
    }
    setPreferences((preferences) => {
      return {
        ...preferences,
        'general.keymap': defaultKeymap,
      }
    })
  }, [keymap, setPreferences])

  useEffect(() => {
    loadKeymaps()
    savePreferences(preferences)
  }, [loadKeymaps, mergedPreferences, preferences, resetKeymap])

  return {
    tab,
    openTab: openSettingsTab,
    closed,
    setClosed,
    togglePreferencesModal,
    preferences: mergedPreferences,
    setPreferences,
    getAcceleratorTypeKeymap,
    getCodemirrorTypeKeymap,
    updateKeymap: updateKeymap,
    removeKeymap,
    resetKeymap,
  }
}

export const {
  StoreProvider: PreferencesProvider,
  useStore: usePreferences,
} = createStoreContext(usePreferencesStore, 'preferences')
