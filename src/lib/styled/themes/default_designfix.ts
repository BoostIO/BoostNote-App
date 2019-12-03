import { BaseThemeDesignfix } from './types_designfix'

/* ———————————–———————————–———————————–——–——
    Colors
———————————–———————————–———————————–——–—— */

/*__ Setting _______________________*/

// Dark Base Colors
const baseColor01 = '#2C2D30'
const baseColor02 = '#1E2022'

// Color Masks
const darkColor026 = 'rgba(0,0,0,0.26)'
const darkColor012 = 'rgba(0,0,0,0.12)'
const lightColor012 = 'rgba(255,255,255,0.12)'
const lightColor030 = 'rgba(255,255,255,0.3)'
const lightColor070 = 'rgba(255,255,255,0.7)'
const lightColor100 = 'rgba(255,255,255,1)'

// System Colors
const primaryColor = '#03C588'
const errorColor = '#0FF6150'
const favColor = '#F1B81B'


/*__ Assign _______________________*/

// Text Colors
const baseTextColor = lightColor070
const subtleTextColor = lightColor030
const emphasizedTextColor = lightColor100
const accentTextColor = primaryColor

// Icon Colors
const baseIconColor = lightColor030
const activeIconColor = lightColor070
const errorIconColor = errorColor
const favIconColor = favColor

// Background Colors
const baseBackgroundColor = baseColor01
const lightBackgroundColor = lightColor012
const preferenceBackgroundColor = baseColor02
const formBackgroundColor = baseColor01
const activeBackgroundColor = baseColor02
const editorBackgroundColor = baseColor02
const codeBackgroundColor = darkColor012
const tagBackgroundColor = darkColor026
const searchBackgroundColor = lightColor030
const accentBackgroundColor = primaryColor

// Border Color
const baseBorderColor = darkColor026
const codeBorderColor = darkColor012
const accentBorderColor = primaryColor
const lightBorderColor = lightColor030
const subtleBorderColor = lightColor012


/* ———————————–———————————–———————————–——–——
    Typography
———————————–———————————–———————————–——–—— */

/*__ Setting _______________________*/

// Font Family
const baseFontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Fira sans', Roboto, Helvetica, Arial, sans-serif 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`

// Font Sizes
const fontSize22 = 22
const fontSize18 = 18
const fontSize16 = 16
const fontSize15 = 15
const fontSize14 = 14
const fontSize13 = 13
const fontSize12 = 12
const fontSize11 = 11
const fontSize10 = 10
const fontSize08 = 8

// Font Weights
const fontWeightBase = 400
const fontWeightMedium = 500

// Line Heights
const lineHeightBase = 1.5
const lineHeightNarrow = 1.2
const lineHeightWide = 2


/*__ Assign _______________________*/

// Font Sizes for Top
const topXLargeFontSize = fontSize16
const topLargeFontSize = fontSize15
const topMediumFontSize = fontSize14
const topBaseFontSize = fontSize12
const topSmallFontSize = fontSize10
const topXSmallFontSize = fontSize08

// Font Sizes for Preference
const prefXLargeFontSize = fontSize22
const prefLargeFontSize = fontSize18
const prefMediumFontSize = fontSize14
const prefBaseFontSize = fontSize13
const prefSmallFontSize = fontSize12
const prefXSmallFontSize = fontSize11
const prefXXSmallFontSize = fontSize10

// Font Sizes for Add & Edit Storage
const storageLargeFontSize = fontSize22
const storageMediumFontSize = fontSize18
const storageBaseFontSize = fontSize13
const storageSmallFontSize = fontSize12
const storageXSmallFontSize = fontSize11
const storageXXSmallFontSize = fontSize10


/* ———————————–———————————–———————————–——–——
    Spacing
———————————–———————————–———————————–——–—— */

// Base Spacing
const space54 = 54
const space48 = 48
const space42 = 42
const space36 = 36
const space30 = 30
const space24 = 24
const space18 = 18
const space12 = 12
const space06 = 6


/* ———————————–———————————–———————————–——–——
    Icon Sizes
———————————–———————————–———————————–——–—— */

// Size Setting
const iconSize32 = 32
const iconSize28 = 28
const iconSize24 = 24
const iconSize20 = 20
const iconSize18 = 18
const iconSize16 = 16


/* ———————————–———————————–———————————–——–——
    Border Radius
———————————–———————————–———————————–——–—— */

// Size Setting
const radius2 = 2
const radius4 = 4


/* ———————————–———————————–———————————–——–——
    Export Base Theme
———————————–———————————–———————————–——–—— */

export const defaultTheme: BaseThemeDesignfix = {

  /* ———————————–———————————–———————————–——–——
    Base Setting
  ———————————–———————————–———————————–——–—— */

  colors: {
    text: baseTextColor,
    link: accentTextColor,
    icon: baseIconColor,
    background: baseBackgroundColor,
    border: baseBorderColor
  },
  fontFamily: baseFontFamily,
  fontSize: fontSize13,
  fontWeight: fontWeightBase,
  lineHeight: lineHeightBase,

  /* ———————————–———————————–———————————–——–——
    Atoms
  ———————————–———————————–———————————–——–—— */

  /*__ Icons _______________________*/

  // Sidebar
  preferenceIconWidth: iconSize28,
  preferenceIconHeight: iconSize28,
  preferenceIconColor: baseIconColor,

  listTitleIconWidth: iconSize20,
  listTitleIconHeight: iconSize20,
  listTitleIconColor: baseIconColor,

  listItemIconWidth: iconSize16,
  listItemIconHeight: iconSize16,
  listItemIconDefaultColor: baseIconColor,
  listItemIconErrorColor: errorIconColor,

  // Search Bar
  searchIconWidth: iconSize20,
  searchIconHeight: iconSize20,
  searchIconColor: baseIconColor,

  addNoteIconWidth: iconSize28,
  addNoteIconHeight: iconSize28,
  addNoteIconColor: baseIconColor,

  // Note Block
  favIconWidth: iconSize24,
  favIconHeight: iconSize24,
  favIconDefaultColor: baseIconColor,
  favIconActiveColor: favIconColor,

  // Toolbar
  toolbarIconWidth: iconSize18,
  toolbarIconHeight: iconSize18,
  toolbarIconDefaultColor: baseIconColor,
  toolbarIconActiveColor: activeIconColor,

  // Preference
  refreshIconWidth: iconSize32,
  refreshIconHeight: iconSize32,
  refreshIconColor: baseIconColor,

  crossIconWidth: iconSize28,
  crossIconHeight: iconSize28,
  crossIconColor: baseIconColor,


  /*__ Buttons _______________________*/

  // Common
  buttonBorderRadius: radius2,
  buttonFontWeight: fontWeightBase,
  buttonLineHeight: lineHeightNarrow,

  // Default Button
  defaultButtonPaddingX: space18,
  defaultButtonPaddingY: space12,
  defaultButtonFontSize: fontSize13,

  // Small Button
  smallButtonPaddingX: space12,
  smallButtonPaddingY: space06,
  smallButtonFontSize: fontSize11,

  // Primary Button
  primaryButtonBackgroundColor: accentBackgroundColor,
  primaryButtonBorderColor: accentBorderColor,
  primaryButtonTextColor: emphasizedTextColor,

  // Secondary Button
  secondaryButtonBackgroundColor: 'transparent',
  secondaryButtonBorderColor: lightBorderColor,
  secondaryButtonTextColor: emphasizedTextColor,

  // Subtle Button
  subtleButtonBackgroundColor: 'transparent',
  subtleButtonBorderColor: subtleBorderColor,
  subtleButtonTextColor: subtleTextColor,


  /*__ Forms _______________________*/

  // Search Bar
  searchbarPaddingX: space12,
  searchbarPaddingY: space06,
  searchbarBackgroundColor: searchBackgroundColor,
  searchbarTextColor: emphasizedTextColor,
  searchbarPlaceHolderColor: subtleTextColor,
  searchbarBorderRadius: radius4,
  searchbarFontSize: fontSize12,
  searchbarFontWeight: fontWeightBase,
  searchbarLineHeight: lineHeightNarrow,
  searchbarIconColor: subtleTextColor,
  searchbarIconRightMargin: 2,

  // Preference Label
  preferenceLabelTextColor: emphasizedTextColor,
  preferenceLabelFontSize: fontSize13,
  preferenceLabelFontWeight: fontWeightBase,
  preferenceLabelLineHeight: lineHeightNarrow,

  // Preference Form
  preferenceFormPaddingX: space18,
  preferenceFormPaddingY: space12,
  preferenceFormBackgroundColor: formBackgroundColor,
  preferenceFormTextColor: emphasizedTextColor,
  preferenceFormPlaceHolderColor: subtleTextColor,
  preferenceFormBorderRadius: radius2,
  preferenceFormFontSize: fontSize12,
  preferenceFormFontWeight: fontWeightBase,
  preferenceFormLineHeight: lineHeightNarrow,


  /*__ Scroll Bar _______________________*/

  scrollBarTrackColor: baseBackgroundColor,
  scrollBarThumbColor: lightBackgroundColor,

}