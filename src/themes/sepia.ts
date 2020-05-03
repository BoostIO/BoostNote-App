import { BaseTheme } from '../lib/styled/BaseTheme'

const base1Color = '#fdf6e4'
const base2Color = '#efe8d6'
const base3Color = '#393733'
const primaryColor = '#b38925'

const dark54Color = 'rgba(0,0,0,0.54)'
const dark26Color = 'rgba(0,0,0,0.26)'
const dark12Color = 'rgba(0,0,0,0.12)'

const light100Color = '#FFF'
const light70Color = 'rgba(255,255,255,0.7)'
const light30Color = 'rgba(255,255,255,0.3)'
const light12Color = 'rgba(255,255,255,0.12)'

export const sepiaTheme: BaseTheme = {
  colors: {
    text: base3Color,
    deemedText: dark26Color,
    inverseText: light100Color,
    background: base1Color,
    alternativeBackground: base2Color,
    active: primaryColor,
    border: dark12Color,
  },

  // General
  textColor: base3Color,
  uiTextColor: base3Color,
  disabledUiTextColor: light30Color,

  primaryColor: primaryColor,
  borderColor: dark12Color,
  iconColor: light30Color,
  activeIconColor: light70Color,
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
  navBackgroundColor: '#fdf6e4',
  navLabelColor: '#555',
  navButtonColor: '#777',
  navButtonHoverColor: '#555',
  navButtonActiveColor: primaryColor,
  navItemColor: '#555',
  navItemBackgroundColor: 'transparent',
  navItemHoverBackgroundColor: '#eee8d6',
  navItemActiveColor: '#111',
  navItemActiveBackgroundColor: '#eee8d6',
  navItemHoverActiveBackgroundColor: '#e0e0e0',

  // Button
  primaryButtonLabelColor: light100Color,
  primaryButtonBackgroundColor: primaryColor,
  secondaryButtonLabelColor: base3Color,
  secondaryButtonBackgroundColor: 'transparent',

  // Input
  inputBackground: dark12Color,
}
