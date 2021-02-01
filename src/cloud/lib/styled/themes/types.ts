export interface InitialTheme {
  fontFamily: string
  fontSizes: {
    xxxsmall: number
    xxsmall: number
    xsmall: number
    small: number
    default: number
    medium: number
    large: number
    xlarge: number
    xxlarge: number
    xxxlarge: number
    xxxxlarge: number
  }
  lineHeights: {
    default: number
    headings: number
    descriptions: number
    leads: number
  }
  lp: {
    space: number[]
    fontSizes: number[]
  }
  breakpoints: {
    mobile: number
    tablet: number
    laptop: number
    desktop: number
  }
  space: {
    xxsmall: number
    xsmall: number
    small: number
    default: number
    medium: number
    large: number
    xlarge: number
    xxlarge: number
    xxxlarge: number
  }
  topHeaderHeight: number

  blueBackgroundColor: string
  lightBlueBackgroundColor: string
  darkerBlueBackgroundColor: string
  darkBlueBackgroundColor: string
  focusShadowColor: string
}

export type BaseTheme = InitialTheme & {
  /* --- Onboarding theme Colors --- */
  reverseTextColor: string
  reverseBackgroundColor: string
  reverseSecondaryBackgroundColor: string
  onboardingShadowColor: string
  /* --- Text Colors --- */

  baseTextColor: string
  subtleTextColor: string
  emphasizedTextColor: string

  whiteTextColor: string

  primaryTextColor: string
  lpPrimaryTextColor: string
  darkerPrimaryTextColor: string

  secondaryTextColor: string

  dangerTextColor: string
  darkerDangerTextColor: string
  darkDangerTextColor: string

  warningTextColor: string
  infoTextColor: string

  /* --- Icon Colors --- */

  baseIconColor: string
  subtleIconColor: string
  emphasizedIconColor: string

  /* --- Background Colors --- */

  blackBackgroundColor: string
  whiteBackgroundColor: string

  baseBackgroundColor: string
  sideNavBackgroundColor: string
  subtleBackgroundColor: string
  emphasizedBackgroundColor: string
  boldBackgroundColor: string
  contextMenuColor: string
  helperBackgroundColor: string

  lightPrimaryBackgroundColor: string
  primaryBackgroundColor: string
  transparentPrimaryBackgroundColor: string
  darkerPrimaryBackgroundColor: string
  darkPrimaryBackgroundColor: string

  lightLpPrimaryBackgroundColor: string
  lpPrimaryBackgroundColor: string
  darkerLpPrimaryBackgroundColor: string
  darkLpPrimaryBackgroundColor: string

  secondaryBackgroundColor: string
  darkerSecondaryBackgroundColor: string
  darkSecondaryBackgroundColor: string

  successBackgroundColor: string
  darkerSuccessBackgroundColor: string
  darkSuccessBackgroundColor: string

  dangerBackgroundColor: string
  darkerDangerBackgroundColor: string
  darkDangerBackgroundColor: string

  warningBackgroundColor: string
  darkerWarningBackgroundColor: string
  darkWarningBackgroundColor: string

  infoBackgroundColor: string
  darkerInfoBackgroundColor: string
  darkInfoBackgroundColor: string

  /* --- Border Colors --- */

  baseBorderColor: string
  subtleBorderColor: string
  divideBorderColor: string

  whiteBorderColor: string

  primaryBorderColor: string
  darkPrimaryBorderColor: string

  secondaryBorderColor: string
  darkSecondaryBorderColor: string

  successBorderColor: string
  darkSuccessBorderColor: string

  dangerBorderColor: string
  darkDangerBorderColor: string

  warningBorderColor: string
  darkWarningBorderColor: string

  infoBorderColor: string
  darkInfoBorderColor: string

  /* --- Shadow Colors --- */

  baseShadowColor: string
  primaryShadowColor: string
}
