import { BaseTheme } from './types'

const base1Color = '#ECECEC'
const base2Color = '#F9F9F9'
const primaryColor = '#03C588'

const dark87Color = 'rgba(0,0,0,0.87)'
const dark54Color = 'rgba(0,0,0,0.54)'
const dark26Color = 'rgba(0,0,0,0.26)'
const dark12Color = 'rgba(0,0,0,0.12)'
const dark100Color = '#000'
const light100Color = '#FFF'

export const lightTheme: BaseTheme = {
  colors: {
    text: dark87Color,
    deemedText: dark26Color,
    inverseText: light100Color,
    background: base1Color,
    alternativeBackground: base2Color,
    active: primaryColor,
    border: dark12Color
  },
  fontSize: 15,
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Fira sans', Roboto, Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,

  // General
  textColor: dark87Color,
  uiTextColor: dark54Color,
  disabledUiTextColor: dark26Color,

  primaryColor: primaryColor,
  borderColor: dark12Color,
  iconColor: dark26Color,
  activeIconColor: dark54Color,
  noteListIconColor: dark26Color,
  noteListActiveIconColor: dark54Color,
  noteDetailIconColor: dark26Color,
  noteDetailActiveIconColor: dark54Color,
  closeIconColor: dark26Color,
  closeActiveIconColor: dark54Color,
  backgroundColor: base1Color,
  secondaryBackgroundColor: base2Color,
  activeBackgroundColor: base2Color,
  shadow: '0 3px 5px rgba(0,0,0,0.1)',

  scrollBarTrackColor: base2Color,
  scrollBarThumbColor: dark12Color,

  // SideBar
  sideBarBackgroundColor: base1Color,
  activeSideBarSecondaryTextColor: dark87Color,
  sideBarTextColor: dark54Color,
  sideBarSecondaryTextColor: dark26Color,

  // Button
  primaryButtonLabelColor: light100Color,
  primaryButtonBackgroundColor: primaryColor,
  secondaryButtonLabelColor: dark100Color,
  secondaryButtonBackgroundColor: 'transparent',

  // Input
  inputBackground: dark12Color
}
