import { useState, useCallback, useMemo, useEffect } from 'react'
import { createStoreContext } from './context'
import { localLiteStorage } from 'ltstrg'
import { useSetState } from 'react-use'
import { useTranslation } from 'react-i18next'
import { preferencesKey } from './localStorageKeys'
import { User } from './accounts'
import { NoteSortingOptions } from './sort'

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

export type KeybindingConfig = number[]

export interface Preferences {
  // General
  'general.accounts': User[]
  'general.language': GeneralLanguageOptions
  'general.theme': GeneralThemeOptions
  'general.noteSorting': NoteSortingOptions
  'general.noteListView': GeneralNoteListViewOptions
  'general.enableAnalytics': boolean
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
  'markdown.includeFrontMatter': boolean

  //Keybindings
  'keybinding.toggleBoostNote': KeybindingConfig
  'keybinding.toggleMenu': KeybindingConfig
  'keybinding.toggleEditMode': KeybindingConfig
  'keybinding.toggleDirection': KeybindingConfig
  'keybinding.deleteNote': KeybindingConfig
  'keybinding.pasteHTML': KeybindingConfig
  'keybinding.prettifyMarkdown': KeybindingConfig
  'keybinding.insertCurrentDate': KeybindingConfig
  'keybinding.insertCurrentDateTime': KeybindingConfig
  'keybinding.nextNote': KeybindingConfig
  'keybinding.previousNote': KeybindingConfig
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
  'general.noteSorting': 'updated-date-dsc',
  'general.enableAnalytics': true,
  'general.enableAutoSync': true,
  'general.noteListView': 'default',

  // Editor
  'editor.theme': 'material-darker',
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

  //Keybindings
  'keybinding.toggleBoostNote': [17, 18],
  'keybinding.toggleMenu': [18],
  'keybinding.toggleEditMode': [17, 77],
  'keybinding.toggleDirection': [17, 39],
  'keybinding.deleteNote': [17, 16, 8],
  'keybinding.pasteHTML': [17, 16, 86],
  'keybinding.prettifyMarkdown': [17, 16, 70],
  'keybinding.insertCurrentDate': [17, 191],
  'keybinding.insertCurrentDateTime': [17, 16, 191],
  'keybinding.nextNote': [],
  'keybinding.previousNote': []
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
