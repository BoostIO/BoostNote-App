import { BaseTheme } from '../lib/styled/BaseTheme'

const base1Color = '#ECECEC'
const base2Color = '#D2D2D2'
const primaryColor = '#5580DC'
const primaryDarkerColor = '#4070D8'
const dangerColor = '#DC3545'

const dark87Color = '#212121'
const dark54Color = 'rgba(0,0,0,0.54)'
const dark26Color = 'rgba(0,0,0,0.26)'
const dark12Color = 'rgba(0,0,0,0.12)'
const dark100Color = '#000'

const light100Color = '#FFF'
const light12Color = 'rgba(255,255,255,0.12)'

export const legacyTheme: BaseTheme = {
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
  backgroundColor: base1Color,
  secondaryBackgroundColor: base2Color,
  activeBackgroundColor: light12Color,
  shadow: '0 3px 5px rgba(0,0,0,0.1)',

  scrollBarTrackColor: base2Color,
  scrollBarThumbColor: dark12Color,

  // SideBar
  navBackgroundColor: '#2c2c2c',
  navLabelColor: '#bbb',
  navButtonColor: '#999',
  navButtonHoverColor: '#bbb',
  navButtonActiveColor: primaryColor,
  navItemColor: '#bbb',
  navItemBackgroundColor: 'transparent',
  navItemHoverBackgroundColor: '#444',
  navItemActiveColor: '#eee',
  navItemActiveBackgroundColor: '#444',
  navItemHoverActiveBackgroundColor: '#555',

  // Team Switcher
  teamSwitcherBackgroundColor: light100Color,
  teamSwitcherBorderColor: 'transparent',
  teamSwitcherTextColor: dark54Color,
  teamSwitcherHoverBackgroundColor: light100Color,
  teamSwitcherHoverTextColor: dark54Color,

  // NotePage
  noteNavEmptyItemColor: '#999',
  noteNavItemBackgroundColor: base2Color,

  // Button
  primaryButtonLabelColor: light100Color,
  primaryButtonBackgroundColor: primaryColor,
  primaryButtonHoverBackgroundColor: primaryDarkerColor,
  secondaryButtonLabelColor: dark100Color,
  secondaryButtonHoverLabelColor: light100Color,
  secondaryButtonBackgroundColor: base2Color,
  secondaryButtonHoverBackgroundColor: '#555',

  // Input
  inputBackground: dark12Color,

  // Search Highlight
  searchHighlightBackgroundColor: '#ffc107',
  searchHighlightSubtleBackgroundColor: '#ffdb70',
  searchItemSelectionTextColor: light100Color,
  searchItemSelectionBackgroundColor: primaryColor,
  searchItemSelectionHoverBackgroundColor: primaryDarkerColor,
  searchHighlightTextColor: dark87Color,

  // Tooltip
  tooltipBackgroundColor: 'rgba(0,0,0,0.8)',
  tooltipTextColor: '#f0f0f0',
}
