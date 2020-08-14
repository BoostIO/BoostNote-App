import { BaseTheme } from '../lib/styled/BaseTheme'

const base1Color = '#1d3f48'
const base2Color = '#18353d'
const primaryColor = '#34a198'

const dark26Color = 'rgba(0,0,0,0.26)'
const light70Color = 'rgba(255,255,255,0.7)'
const light30Color = 'rgba(255,255,255,0.3)'
const light12Color = 'rgba(255,255,255,0.12)'
const light100Color = '#FFF'

export const solarizedDarkTheme: BaseTheme = {
  colors: {
    text: light70Color,
    deemedText: light30Color,
    inverseText: light100Color,
    background: light100Color,
    alternativeBackground: light12Color,
    active: primaryColor,
    border: dark26Color,
  },
  // General
  textColor: light100Color,
  uiTextColor: light70Color,
  disabledUiTextColor: light30Color,

  primaryColor: primaryColor,
  borderColor: dark26Color,
  noteListIconColor: light30Color,
  noteListActiveIconColor: light70Color,
  noteDetailIconColor: light30Color,
  noteDetailActiveIconColor: light70Color,
  closeIconColor: light30Color,
  closeActiveIconColor: light70Color,
  backgroundColor: base1Color,
  secondaryBackgroundColor: base2Color,
  activeBackgroundColor: base2Color,
  shadow: '0 3px 5px rgba(0,0,0,0.1)',

  scrollBarTrackColor: base2Color,
  scrollBarThumbColor: light12Color,

  // SideBar
  navBackgroundColor: '#0c3641',
  navLabelColor: '#bbb',
  navButtonColor: '#bbb',
  navButtonHoverColor: '#eee',
  navButtonActiveColor: primaryColor,
  navItemColor: '#bbb',
  navItemBackgroundColor: 'transparent',
  navItemHoverBackgroundColor: '#0E404D',
  navItemActiveColor: '#eee',
  navItemActiveBackgroundColor: '#0E404D',
  navItemHoverActiveBackgroundColor: '#104B59',

  // NotePage
  noteNavEmptyItemColor: '#bbb',

  // Button
  primaryButtonLabelColor: light100Color,
  primaryButtonBackgroundColor: primaryColor,
  secondaryButtonLabelColor: light100Color,
  secondaryButtonBackgroundColor: 'transparent',

  // Input
  inputBackground: light12Color,
}
