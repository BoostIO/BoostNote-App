export type GeneralThemeOptions = 'auto' | 'light' | 'dark' | 'solarized-dark'
export type GeneralLanguageOptions = 'en-US' | 'ja'
export type GeneralNoteSortingOptions =
  | 'date-updated'
  | 'date-created'
  | 'title'

export type EditorIndentTypeOptions = 'tab' | 'spaces'
export type EditorIndentSizeOptions = 2 | 4 | 8
export type EditorKeymapOptions = 'default' | 'vim' | 'emacs'

export interface Preferences {
  // General
  'general.accounts': []
  'general.language': GeneralLanguageOptions
  'general.theme': GeneralThemeOptions
  'general.noteSorting': GeneralNoteSortingOptions
  'general.enableAnalytics': boolean

  // Editor
  'editor.theme': string
  'editor.fontSize': number
  'editor.fontFamily': string
  'editor.indentType': EditorIndentTypeOptions
  'editor.indentSize': EditorIndentSizeOptions
  'editor.keymap': EditorKeymapOptions

  // Markdown
  'markdown.previewStyle': string
  'markdown.codeBlockTheme': string
}
