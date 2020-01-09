import { User } from '../accounts'

export type GeneralThemeOptions =
  | 'auto'
  | 'light'
  | 'dark'
  | 'sepia'
  | 'solarizedDark'
export type GeneralLanguageOptions =
  | 'en-US'
  | 'ja'
  | 'es-ES'
  | 'zh-CN'
  | 'ko'
  | 'pt-BR'
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
