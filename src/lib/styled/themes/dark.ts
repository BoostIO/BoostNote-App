import { BaseTheme } from './types'

const textColor = '#333'
const deemedTextColor = '#999'
const inverseTextColor = '#FFF'
const backgroundColor = '#FFF'
const alternativeBackgroundColor = '#F8F8F8'
const activeColor = '#63AEFC'
const borderColor = '#E5E5E5'

const base1Color = '#2c2d30'
const base2Color = '#1e2022'
const primaryColor = '#03C588'
const light70Color = 'rgba(255,255,255,0.7)'
const light30Color = 'rgba(255,255,255,0.3)'
const light12Color = 'rgba(255,255,255,0.12)'
const light100Color = '#FFF'

export const darkTheme: BaseTheme = {
  colors: {
    text: textColor,
    deemedText: deemedTextColor,
    inverseText: inverseTextColor,
    background: backgroundColor,
    alternativeBackground: alternativeBackgroundColor,
    active: activeColor,
    border: borderColor
  },
  fontSize: 15,
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Fira sans', Roboto, Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,

  // General
  textColor: light100Color,
  uiTextColor: light70Color,
  activeUiTextColor: light100Color,
  disabledUiTextColor: light30Color,

  primaryColor: primaryColor,
  borderColor: light12Color,
  iconColor: light30Color,
  activeIconColor: light70Color,
  backgroundColor: base1Color,
  secondaryBackgroundColor: base2Color,
  activeBackgroundColor: base2Color,
  shadow: '0 2px 24px rgba(0,0,0,0.5)',

  scrollBarTrackColor: base2Color,
  scrollBarThumbColor: light12Color,

  // SideBar
  sideBarBackgroundColor: base1Color,
  sideBarTextColor: light70Color,
  sideBarSecondaryTextColor: light30Color,

  // Button
  primaryButtonLabelColor: light100Color,
  primaryButtonBackgroundColor: primaryColor,
  secondaryButtonLabelColor: light100Color,
  secondaryButtonBackgroundColor: 'transparent',

  // Input
  inputBackground: light12Color
}
