export type GeneralThemeOptions = 'light' | 'dark'
export type GeneralLanguageOptions = 'en-US' | 'ja'
export type GeneralEditorIndentType = 'spaces' | 'tab'
export type GeneralEditorIndentSize = 2 | 4 | 8

export interface UserSettings {
  // General
  'general.language': GeneralLanguageOptions
  'general.theme': GeneralThemeOptions
  'general.editorTheme': CodeMirrorEditorTheme
  'general.codeBlockTheme': CodeMirrorEditorTheme
  'general.customBlockEditorTheme': MonacoEditorTheme
  'general.editorKeyMap': CodeMirrorKeyMap
  'general.editorIndentType': GeneralEditorIndentType
  'general.editorIndentSize': GeneralEditorIndentSize
}

export const codeMirrorEditorThemes = [
  'default',
  '3024-day',
  '3024-night',
  'abcdef',
  'ambiance-mobile',
  'ambiance',
  'ayu-dark',
  'ayu-mirage',
  'base16-dark',
  'base16-light',
  'bespin',
  'blackboard',
  'cobalt',
  'colorforth',
  'darcula',
  'dracula',
  'duotone-dark',
  'duotone-light',
  'eclipse',
  'elegant',
  'erlang-dark',
  'gruvbox-dark',
  'hopscotch',
  'icecoder',
  'idea',
  'isotope',
  'lesser-dark',
  'liquibyte',
  'lucario',
  'material-darker',
  'material-ocean',
  'material-palenight',
  'material',
  'mbo',
  'mdn-like',
  'midnight',
  'monokai',
  'moxer',
  'neat',
  'neo',
  'night',
  'nord',
  'oceanic-next',
  'panda-syntax',
  'paraiso-dark',
  'paraiso-light',
  'pastel-on-dark',
  'railscasts',
  'rubyblue',
  'seti',
  'shadowfox',
  'solarized',
  'solarized-dark',
  'ssms',
  'the-matrix',
  'tomorrow-night-bright',
  'tomorrow-night-eighties',
  'ttcn',
  'twilight',
  'vibrant-ink',
  'xq-dark',
  'xq-light',
  'yeti',
  'yonce',
  'zenburn',
] as const

export const monacoThemes = ['dark', 'light', 'high-contrast-dark'] as const
export const codeMirrorKeyMap = ['default', 'emacs', 'vim'] as const

export type CodeMirrorEditorTheme = typeof codeMirrorEditorThemes[number]
export type MonacoEditorTheme = typeof monacoThemes[number]
export type CodeMirrorKeyMap = typeof codeMirrorKeyMap[number]
