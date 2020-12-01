import { BaseTheme } from '../lib/styled/BaseTheme'

const base1Color = '#ECECEC'
const base2Color = '#F9F9F9'
const primaryColor = '#5580DC'
const primaryDarkerColor = '#4070D8'
const dangerColor = '#DC3545'

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
  primaryDarkerColor: primaryDarkerColor,
  dangerColor: dangerColor,
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

  // Team Switcher
  teamSwitcherBackgroundColor: light100Color,
  teamSwitcherBorderColor: dark12Color,
  teamSwitcherTextColor: dark54Color,
  teamSwitcherHoverBackgroundColor: light100Color,
  teamSwitcherHoverTextColor: dark54Color,

  // NotePage
  noteNavEmptyItemColor: uiDimColor,
  noteNavItemBackgroundColor: uiVividBackgroundColor,

  // Button
  primaryButtonLabelColor: light100Color,
  primaryButtonBackgroundColor: primaryColor,
  primaryButtonHoverBackgroundColor: primaryDarkerColor,
  secondaryButtonLabelColor: dark100Color,
  secondaryButtonHoverLabelColor: light100Color,
  secondaryButtonBackgroundColor: uiVividBackgroundColor,
  secondaryButtonHoverBackgroundColor: uiVivid2BackgroundColor,

  // Input
  inputBackground: '#fff',

  // Search Highlight
  searchHighlightBackgroundColor: '#1362ac',
  searchItemSelectionBackgroundColor: '#45c4c0',
}
