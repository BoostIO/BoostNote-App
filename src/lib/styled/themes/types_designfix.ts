export interface BaseThemeDesignfix {

  /* ———————————–———————————–———————————–——–——
    Base Setting
  ———————————–———————————–———————————–——–—— */

  colors: any
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number


  /* ———————————–———————————–———————————–——–——
    Atoms
  ———————————–———————————–———————————–——–—— */

  /*__ Icons _______________________*/

  // Sidebar
  preferenceIconWidth: number
  preferenceIconHeight: number
  preferenceIconColor: string

  listTitleIconWidth: number
  listTitleIconHeight: number
  listTitleIconColor: string

  listItemIconWidth: number
  listItemIconHeight: number
  listItemIconDefaultColor: string
  listItemIconErrorColor: string

  // Search Bar
  searchIconWidth: number
  searchIconHeight: number
  searchIconColor: string

  addNoteIconWidth: number
  addNoteIconHeight: number
  addNoteIconColor: string

  // Note Block
  favIconWidth: number
  favIconHeight: number
  favIconDefaultColor: string
  favIconActiveColor: string

  // Toolbar
  toolbarIconWidth: number
  toolbarIconHeight: number
  toolbarIconDefaultColor: string
  toolbarIconActiveColor: string

  // Preference
  refreshIconWidth: number
  refreshIconHeight: number
  refreshIconColor: string

  crossIconWidth: number
  crossIconHeight: number
  crossIconColor: string


  /*__ Buttons _______________________*/

  // Common
  buttonBorderRadius: number
  buttonFontWeight: number
  buttonLineHeight: number

  // Default Button
  defaultButtonPaddingX: number
  defaultButtonPaddingY: number
  defaultButtonFontSize: number

  // Small Button
  smallButtonPaddingX: number
  smallButtonPaddingY: number
  smallButtonFontSize: number

  // Primary Button
  primaryButtonBackgroundColor: string
  primaryButtonBorderColor: string
  primaryButtonTextColor: string

  // Secondary Button
  secondaryButtonBackgroundColor: string
  secondaryButtonBorderColor: string
  secondaryButtonTextColor: string

  // Subtle Button
  subtleButtonBackgroundColor: string
  subtleButtonBorderColor: string
  subtleButtonTextColor: string


  /*__ Forms _______________________*/

  // Search Bar
  searchbarPaddingX: number
  searchbarPaddingY: number
  searchbarBackgroundColor: string
  searchbarTextColor: string
  searchbarPlaceHolderColor: string
  searchbarBorderRadius: number
  searchbarFontSize: number
  searchbarFontWeight: number
  searchbarLineHeight: number
  searchbarIconColor: string
  searchbarIconRightMargin: number

  // Preference Label
  preferenceLabelTextColor: string
  preferenceLabelFontSize: number
  preferenceLabelFontWeight: number
  preferenceLabelLineHeight: number

  // Preference Form
  preferenceFormPaddingX: number
  preferenceFormPaddingY: number
  preferenceFormBackgroundColor: string
  preferenceFormTextColor: string
  preferenceFormPlaceHolderColor: string
  preferenceFormBorderRadius: number
  preferenceFormFontSize: number
  preferenceFormFontWeight: number
  preferenceFormLineHeight: number


  /*__ Scroll Bar _______________________*/

  scrollBarTrackColor: string
  scrollBarThumbColor: string


  /* ———————————–———————————–———————————–——–——
    Molecules
  ———————————–———————————–———————————–——–—— */

  /*__ Top _______________________*/

  // Context Menu
  // Search Bar
  // Note Block
  // Toolbar

  /*__ Preferences _______________________*/

  // Nav
  // Account
  // Account

  /* ———————————–———————————–———————————–——–——
    Organisms
  ———————————–———————————–———————————–——–—— */

  /*__ Top _______________________*/

  // Side Bar
  // Note List
  // Editor

  /*__ Preference _______________________*/

  // Navigator
  // General
  // Editor
  // Markdown
  // Hotkeys
  // About

  /*__ Storage _______________________*/

  // Add Storage
  // Edit Storage

}
