import { useState, useCallback, useMemo, useEffect } from 'react'
import { createStoreContext } from './context'
import { localLiteStorage } from 'ltstrg'
import { useSetState } from 'react-use'
import { useTranslation } from 'react-i18next'
import { preferencesKey } from './localStorageKeys'
import { User } from './accounts'

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
  | 'ja'
  | 'ko'
  | 'pt-BR'
  | 'uk-UA'
  | 'zh-CN'
  | 'zh-HK'
  | 'zh-TW'
export type GeneralNoteSortingOptions =
  | 'date-updated'
  | 'date-created'
  | 'title'
export type GeneralTutorialsOptions = 'display' | 'hide'

export type EditorIndentTypeOptions = 'tab' | 'spaces'
export type EditorIndentSizeOptions = 2 | 4 | 8
export type EditorKeyMapOptions = 'default' | 'vim' | 'emacs'

export interface Preferences {
  // General
  'general.accounts': User[]
  'general.language': GeneralLanguageOptions
  'general.theme': GeneralThemeOptions
  'general.noteSorting': GeneralNoteSortingOptions
  'general.enableAnalytics': boolean
  'general.enableDownloadAppModal': boolean
  'general.tutorials': GeneralTutorialsOptions
  'general.enableAutoSync': boolean

  // Editor
  'editor.theme': string
  'editor.fontSize': number
  'editor.fontFamily': string
  'editor.indentType': EditorIndentTypeOptions
  'editor.indentSize': EditorIndentSizeOptions
  'editor.keyMap': EditorKeyMapOptions

  // Markdown
  'markdown.previewStyle': string
  'markdown.codeBlockTheme': string
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
  'general.accounts': [],
  'general.language': 'en-US',
  'general.theme': 'dark',
  'general.noteSorting': 'date-updated',
  'general.enableAnalytics': true,
  'general.enableDownloadAppModal': true,
  'general.tutorials': 'display',
  'general.enableAutoSync': true,

  // Editor
  'editor.theme': 'default',
  'editor.fontSize': 15,
  'editor.fontFamily':
    'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
  'editor.indentType': 'spaces',
  'editor.indentSize': 4,
  'editor.keyMap': 'default',

  // Markdown
  'markdown.previewStyle': 'default',
  'markdown.codeBlockTheme': 'default',
}

function usePreferencesStore() {
  const [preferences, setPreferences] = useSetState<Preferences>(
    initialPreferences
  )
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
  const toggleClosed = useCallback(() => {
    if (closed) {
      setClosed(false)
    } else {
      setClosed(true)
    }
  }, [closed, setClosed])

  const currentLanguage = mergedPreferences['general.language']
  const { i18n } = useTranslation('preferences')
  useEffect(() => {
    i18n.changeLanguage(currentLanguage)
  }, [i18n, currentLanguage])

  return {
    closed,
    setClosed,
    toggleClosed,
    preferences: mergedPreferences,
    setPreferences,
  }
}

export const {
  StoreProvider: PreferencesProvider,
  useStore: usePreferences,
} = createStoreContext(usePreferencesStore, 'preferences')

export function useFirstUser() {
  const { preferences } = usePreferences()
  return useMemo(() => {
    return preferences['general.accounts'][0]
  }, [preferences])
}
