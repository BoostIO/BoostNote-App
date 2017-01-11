import Immutable, { Map } from 'immutable'

/**
 * Stuff
 */
export const CODEMIRROR_THEMES = process.env.CODEMIRROR_THEMES

/**
 * Default Status
 */
export const NAV_MIN_WIDTH = 150
export const LIST_MIN_WIDTH = 150

/**
 * Default State for Redux reducers
 */
export const DEFAULT_CONFIG = new Map({
  // default, dark
  theme: 'default',

  editorFontSize: 14,
  editorFontFamily: 'Consolas, "Liberation Mono", Menlo, Courier',
  editorTheme: 'dracula',
  // space, tab
  editorIndentStyle: 'space',
  editorIndentSize: 2,

  previewFontSize: 14,
  previewFontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial',
  previewCodeBlockTheme: 'dracula',
  previewCodeBlockFontFamily: 'Consolas, "Liberation Mono", Menlo, Courier'
})

export const DEFAULT_STATUS = Map({
  navHidden: false,
  // folders, tags
  navTab: 'folders',
  navWidth: 150,
  noteListWidth: 200,
  // NORMAL, COMPACT
  noteListStyle: 'NORMAL',
  // UPDATED_AT, CREATED_AT, ALPHABET
  noteListSort: 'UPDATED_AT',
  // SINGLE, TWO_PANE
  editorMode: 'SINGLE',
  editorSingleWidth: 440,
  editorDoubleWidth: 800
})

export const DEFAULT_KEYMAP = Immutable.fromJS({
  main: {
  },
  nav: {
    A: 'title:new-note',
    'Shift-A': 'nav:new-folder',
    Enter: 'list:focus',
    Right: 'list:focus',
    Up: 'nav:up',
    Down: 'nav:down',
    D: 'nav:delete',
    Tab: 'nav:toggle-tab'
  },
  list: {
    Enter: 'detail:focus',
    E: 'detail:focus',
    Esc: 'nav:focus',
    Up: 'list:up',
    Left: 'nav:focus',
    Right: 'detail:focus',
    Down: 'list:down',
    A: 'title:new-note',
    D: 'list:delete'
  },
  detail: {
    Esc: 'list:focus',
    'Shift-Cmd-7': 'detail:focus-tag-select',
    'Cmd-\'': 'detail:focus-tag-select'
  }
})

export default {
  CODEMIRROR_THEMES,

  NAV_MIN_WIDTH,
  LIST_MIN_WIDTH,

  DEFAULT_CONFIG,
  DEFAULT_STATUS,
  DEFAULT_KEYMAP
}
