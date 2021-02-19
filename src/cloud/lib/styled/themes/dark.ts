import { BaseTheme } from './types'
import { sharedTheme } from './shared'

/* ———————————–———————————–———————————–——–——
    Color Palette
———————————–———————————–———————————–——–—— */

// Dark Theme Gradation
const theme50Color = '#FAFAFA'
// const theme100Color = '#EDEDEE'
const theme200Color = '#D2D3D6'
const theme300Color = '#B7B9BE'
const theme400Color = '#9DA0A5'
const theme500Color = '#757980'
const theme600Color = '#5D6066'
const theme700Color = '#45474B'
const theme800Color = '#1E2024'
const theme900Color = '#070708'

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
const shadowColor = '0 5px 10px rgba(0,0,0,0.4)'

/* ———————————–———————————–———————————–——–——
    Export Dark Theme
———————————–———————————–———————————–——–—— */

export const darkTheme: BaseTheme = {
  ...sharedTheme,

  /* --- Onboarding Colors --- */

  reverseBackgroundColor: '#FCFCFD',
  reverseSecondaryBackgroundColor: '#D2D3D6',
  reverseTextColor: '#45474B',
  onboardingShadowColor: '0px 0px 1px 4px rgba(78, 131, 237, 1)',

  /* --- Text Colors --- */

  baseTextColor: theme200Color,
  subtleTextColor: theme500Color,
  emphasizedTextColor: theme50Color,

  whiteTextColor: whiteColor,

  primaryTextColor: primaryColor,
  lpPrimaryTextColor: lpPrimaryColor,
  darkerPrimaryTextColor: darkPrimaryColor,

  secondaryTextColor: theme600Color,

  dangerTextColor: dangerColor,
  darkerDangerTextColor: darkerDangerColor,
  darkDangerTextColor: darkDangerColor,

  warningTextColor: warningColor,
  infoTextColor: infoColor,

  /* --- Icon Colors --- */

  baseIconColor: theme300Color,
  subtleIconColor: theme400Color,
  emphasizedIconColor: whiteColor,

  /* --- Background Colors --- */

  blackBackgroundColor: blackColor,
  whiteBackgroundColor: whiteColor,

  baseBackgroundColor: theme800Color,
  sideNavBackgroundColor: theme800Color,
  subtleBackgroundColor: theme700Color,
  emphasizedBackgroundColor: theme600Color,
  boldBackgroundColor: theme900Color,
  contextMenuColor: '#27282B',
  helperBackgroundColor: '#45474b',

  lightPrimaryBackgroundColor: lightPrimaryColor,
  primaryBackgroundColor: primaryColor,
  transparentPrimaryBackgroundColor: transparentPrimaryColor,
  darkerPrimaryBackgroundColor: darkerPrimaryColor,
  darkPrimaryBackgroundColor: darkPrimaryColor,

  lightLpPrimaryBackgroundColor: lightLpPrimaryColor,
  lpPrimaryBackgroundColor: lpPrimaryColor,
  darkerLpPrimaryBackgroundColor: darkerLpPrimaryColor,
  darkLpPrimaryBackgroundColor: darkLpPrimaryColor,

  secondaryBackgroundColor: theme500Color,
  darkerSecondaryBackgroundColor: theme600Color,
  darkSecondaryBackgroundColor: theme700Color,

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

  baseBorderColor: theme700Color,
  subtleBorderColor: theme700Color,
  divideBorderColor: theme700Color,

  whiteBorderColor: whiteColor,

  primaryBorderColor: primaryColor,
  darkPrimaryBorderColor: darkPrimaryColor,

  secondaryBorderColor: theme600Color,
  darkSecondaryBorderColor: theme900Color,

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
