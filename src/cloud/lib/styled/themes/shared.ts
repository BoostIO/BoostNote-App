import { InitialTheme } from './types'

export const sharedTheme: InitialTheme = {
  fontFamily: `Lato, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif`,
  fontSizes: {
    xxxsmall: 8,
    xxsmall: 10,
    xsmall: 11,
    small: 12,
    default: 13,
    medium: 15,
    large: 20,
    xlarge: 22,
    xxlarge: 24,
    xxxlarge: 32,
    xxxxlarge: 40,
  },
  lineHeights: {
    default: 1,
    headings: 1.3,
    descriptions: 1.6,
    leads: 2.3,
  },
  breakpoints: {
    mobile: 425,
    tablet: 768,
    laptop: 1024,
    desktop: 1280,
  },
  space: {
    xxsmall: 4,
    xsmall: 8,
    small: 16,
    default: 24,
    medium: 32,
    large: 40,
    xlarge: 48,
    xxlarge: 64,
    xxxlarge: 80,
  },
  lp: {
    space: [0, 5, 10, 16, 24, 32, 40, 48, 56, 64, 120, 240],
    fontSizes: [14, 16, 18, 20, 28, 40, 48],
  },
  topHeaderHeight: 45,
  lightBlueBackgroundColor: '#90afed',
  blueBackgroundColor: '#4e83ed',
  darkerBlueBackgroundColor: '#286efa',
  darkBlueBackgroundColor: '#2259c7',

  focusShadowColor: 'rgba(71, 170, 255, 0.6)',
}
