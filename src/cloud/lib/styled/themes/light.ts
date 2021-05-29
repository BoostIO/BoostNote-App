import { BaseTheme } from './types'
import { sharedTheme } from './shared'

/* ———————————–———————————–———————————–——–——
    Color Palette
———————————–———————————–———————————–——–—— */

// Light Theme Gradation
const theme50Color = '#FCFCFD'
const theme100Color = '#EDEDEE'
const theme200Color = '#D2D3D6'
const theme300Color = '#B7B9BE'
const theme400Color = '#9DA0A5'
const theme500Color = '#757980'
const theme600Color = '#5D6066'
const theme700Color = '#45474B'
const theme800Color = '#2C2D30'
const theme900Color = '#141416'
const theme1000Color = '#f7f6f3'

// White Color
const whiteColor = '#FFF'
const blackColor = '#000'

// Primary Colors
const lightPrimaryColor = '#EAF1F3'
const primaryColor = '#5580DC'
const transparentPrimaryColor = 'rgba(85, 128, 220, .2)'
const darkerPrimaryColor = '#5079D2'
const darkPrimaryColor = '#003B44'

// LP Primary Colors
const lightLpPrimaryColor = '#EAF1F3'
const lpPrimaryColor = '#5580DC'
const darkerLpPrimaryColor = '#5079D2'
const darkLpPrimaryColor = '#003B44'

// Success Colors
const successColor = '#7FB069'
const darkerSuccessColor = '#65974F'
const darkSuccessColor = '#446535'

// Danger Colors
const dangerColor = '#EF5B5B'
const darkerDangerColor = '#EA2D2D'
const darkDangerColor = '#8A0D0D'

// Warning Colors
const warningColor = '#FFBA49'
const darkerWarningColor = '#FFA716'
const darkWarningColor = '#AF6D00'

// Info Colors
const infoColor = '#0091AD'
const darkerInfoColor = '#00667A'
const darkInfoColor = '#003C47'

// Shadow Color
const shadowColor = '0px 0px 13px rgba(0,0,0,0.1)'

/* ———————————–———————————–———————————–——–——
    Export Dark Theme
———————————–———————————–———————————–——–—— */

export const lightTheme: BaseTheme = {
  ...sharedTheme,

  /* --- Onboarding Colors --- */

  reverseBackgroundColor: '#2C2D30',
  reverseSecondaryBackgroundColor: '#141416',
  reverseTextColor: '#EDEDEE',
  onboardingShadowColor: '0px 0px 1px 4px rgba(78, 131, 237, 1)',

  /* --- Text Colors --- */

  baseTextColor: theme700Color,
  subtleTextColor: theme400Color,
  emphasizedTextColor: theme900Color,

  whiteTextColor: whiteColor,
  primaryTextColor: primaryColor,
  lpPrimaryTextColor: lpPrimaryColor,
  darkerPrimaryTextColor: darkPrimaryColor,

  secondaryTextColor: theme400Color,

  dangerTextColor: dangerColor,
  darkerDangerTextColor: darkerDangerColor,
  darkDangerTextColor: darkDangerColor,

  warningTextColor: warningColor,
  infoTextColor: infoColor,
  successTextColor: successColor,

  /* --- Icon Colors --- */

  baseIconColor: theme600Color,
  subtleIconColor: theme300Color,
  emphasizedIconColor: theme800Color,

  /* --- Background Colors --- */

  blackBackgroundColor: blackColor,
  whiteBackgroundColor: whiteColor,

  baseBackgroundColor: theme50Color,
  sideNavBackgroundColor: theme1000Color,
  subtleBackgroundColor: theme100Color,
  emphasizedBackgroundColor: theme200Color,
  boldBackgroundColor: whiteColor,
  contextMenuColor: whiteColor,
  helperBackgroundColor: '#EFEFEF',

  lightPrimaryBackgroundColor: lightPrimaryColor,
  primaryBackgroundColor: primaryColor,
  transparentPrimaryBackgroundColor: transparentPrimaryColor,
  darkerPrimaryBackgroundColor: darkerPrimaryColor,
  darkPrimaryBackgroundColor: darkPrimaryColor,

  lightLpPrimaryBackgroundColor: lightLpPrimaryColor,
  lpPrimaryBackgroundColor: lpPrimaryColor,
  darkerLpPrimaryBackgroundColor: darkerLpPrimaryColor,
  darkLpPrimaryBackgroundColor: darkLpPrimaryColor,

  secondaryBackgroundColor: theme400Color,
  darkerSecondaryBackgroundColor: theme500Color,
  darkSecondaryBackgroundColor: theme600Color,

  successBackgroundColor: successColor,
  darkerSuccessBackgroundColor: darkerSuccessColor,
  darkSuccessBackgroundColor: darkSuccessColor,

  dangerBackgroundColor: dangerColor,
  darkerDangerBackgroundColor: darkerDangerColor,
  darkDangerBackgroundColor: darkDangerColor,

  warningBackgroundColor: warningColor,
  darkerWarningBackgroundColor: darkerWarningColor,
  darkWarningBackgroundColor: darkWarningColor,

  infoBackgroundColor: infoColor,
  darkerInfoBackgroundColor: darkerInfoColor,
  darkInfoBackgroundColor: darkInfoColor,

  /* --- Border Colors --- */

  baseBorderColor: theme200Color,
  subtleBorderColor: theme100Color,
  divideBorderColor: theme100Color,

  whiteBorderColor: whiteColor,

  primaryBorderColor: primaryColor,
  darkPrimaryBorderColor: darkPrimaryColor,

  secondaryBorderColor: theme400Color,
  darkSecondaryBorderColor: theme600Color,

  successBorderColor: successColor,
  darkSuccessBorderColor: darkSuccessColor,

  dangerBorderColor: dangerColor,
  darkDangerBorderColor: darkDangerColor,

  warningBorderColor: warningColor,
  darkWarningBorderColor: darkWarningColor,

  infoBorderColor: infoColor,
  darkInfoBorderColor: darkInfoColor,

  /* --- Shadow Colors --- */

  baseShadowColor: shadowColor,
  primaryShadowColor: primaryColor,
}
