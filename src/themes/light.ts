import { BaseTheme } from '../lib/styled/BaseTheme'

const base1Color = '#ECECEC'
const base2Color = '#F9F9F9'
const primaryColor = '#02A47E'

const dark87Color = 'rgba(0,0,0,0.87)'
const dark54Color = 'rgba(0,0,0,0.54)'
const dark26Color = 'rgba(0,0,0,0.26)'
const dark12Color = '#bbb'
const dark100Color = '#000'
const light100Color = '#FFF'

const uiColor = '#808080'
const uiDimColor = '#999'
const uiVividColor = '#555'

const uiBackgroundColor = '#fff'
const uiVividBackgroundColor = '#e4e4e4'
const uiVivid2BackgroundColor = '#d4d4d4'

export const lightTheme: BaseTheme = {
  colors: {
    text: dark87Color,
    deemedText: dark26Color,
    inverseText: light100Color,
    background: base1Color,
    alternativeBackground: base2Color,
    active: primaryColor,
    border: dark12Color,
  },

  // General
  textColor: dark87Color,
  uiTextColor: dark54Color,
  disabledUiTextColor: dark26Color,

  primaryColor: primaryColor,
  borderColor: dark12Color,

  noteListIconColor: dark26Color,
  noteListActiveIconColor: dark54Color,
  noteDetailIconColor: dark26Color,
  noteDetailActiveIconColor: dark54Color,
  closeIconColor: dark26Color,
  closeActiveIconColor: dark54Color,
  backgroundColor: '#fff',
  secondaryBackgroundColor: uiVividBackgroundColor,
  activeBackgroundColor: uiVividBackgroundColor,
  shadow: '0 3px 5px rgba(0,0,0,0.1)',

  scrollBarTrackColor: base2Color,
  scrollBarThumbColor: dark12Color,

  // SideBar
  navBackgroundColor: uiBackgroundColor,
  navLabelColor: uiColor,
  navButtonColor: uiDimColor,
  navButtonHoverColor: uiColor,
  navButtonActiveColor: primaryColor,
  navItemColor: uiColor,
  navItemBackgroundColor: 'transparent',
  navItemHoverBackgroundColor: uiVividBackgroundColor,
  navItemActiveColor: uiVividColor,
  navItemActiveBackgroundColor: uiVividBackgroundColor,
  navItemHoverActiveBackgroundColor: uiVivid2BackgroundColor,

  // NotePage
  noteNavEmptyItemColor: uiDimColor,

  // Button
  primaryButtonLabelColor: light100Color,
  primaryButtonBackgroundColor: primaryColor,
  secondaryButtonLabelColor: dark100Color,
  secondaryButtonBackgroundColor: 'transparent',

  // Input
  inputBackground: '#fff',
}
