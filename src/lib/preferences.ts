import { useState, useCallback, useMemo, useEffect } from 'react'
import { createStoreContext } from './context'
import { localLiteStorage } from 'ltstrg'
import { useSetState } from 'react-use'
import { useTranslation } from 'react-i18next'
import { preferencesKey } from './localStorageKeys'
import { NoteSortingOptions } from './sort'
import { nodeEnv } from '../cloud/lib/consts'
import { setAccessToken } from '../cloud/lib/stores/electron'

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

export interface Preferences {
  // General
  'general.language': GeneralLanguageOptions
  'general.theme': GeneralThemeOptions
  'general.showAppNavigator': boolean
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
}

function loadPreferences() {
  const stringifiedPreferences = localLiteStorage.getItem(preferencesKey)
  if (stringifiedPreferences == null) return {}
  try {
    return JSON.parse(stringifiedPreferences)
  } catch (error) {
    console.warn(error.message)
    return {}
  }
}

function savePreferences(preferences: Partial<Preferences>) {
  localLiteStorage.setItem(preferencesKey, JSON.stringify(preferences))
}

const initialPreferences = loadPreferences()

const basePreferences: Preferences = {
  // General
  'general.showAppNavigator': true,
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
}

function usePreferencesStore() {
  const [preferences, setPreferences] = useSetState<Preferences>(
    initialPreferences
  )
  const [tab, setTab] = useState('about')
  useEffect(() => {
    savePreferences(preferences)
  }, [preferences])

  const mergedPreferences = useMemo(() => {
    return {
      ...basePreferences,
      ...preferences,
    }
  }, [preferences])

  const [closed, setClosed] = useState(true)
  const togglePreferencesModal = useCallback(() => {
    if (closed) {
      setTab('about')
      setClosed(false)
    } else {
      setClosed(true)
    }
  }, [closed, setClosed])

  const openTab = useCallback(
    (tab: string) => {
      setTab(tab)
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

  return {
    tab,
    openTab,
    closed,
    setClosed,
    togglePreferencesModal,
    preferences: mergedPreferences,
    setPreferences,
  }
}

export const {
  StoreProvider: PreferencesProvider,
  useStore: usePreferences,
} = createStoreContext(usePreferencesStore, 'preferences')
