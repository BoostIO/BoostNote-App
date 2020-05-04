import { BaseTheme } from '../lib/styled/BaseTheme'

const base1Color = '#2c2c2c'
const base2Color = '#1e2022'
const primaryColor = '#02A47E'

const dark26Color = 'rgba(0,0,0,0.26)'
const light70Color = 'rgba(255,255,255,0.7)'
const light30Color = 'rgba(255,255,255,0.3)'
const light12Color = 'rgba(255,255,255,0.12)'
const light100Color = '#FFF'

export const darkTheme: BaseTheme = {
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
  borderColor: '#202020',
  noteListIconColor: light30Color,
  noteListActiveIconColor: light70Color,
  noteDetailIconColor: light30Color,
  noteDetailActiveIconColor: light70Color,
  closeIconColor: light30Color,
  closeActiveIconColor: light70Color,
  backgroundColor: base1Color,
  secondaryBackgroundColor: base2Color,
  activeBackgroundColor: base2Color,
  shadow: '0 3px 5px rgba(0,0,0,0.3)',

  scrollBarTrackColor: '#2c2c2c',
  scrollBarThumbColor: '#555',

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

  // NotePage
  noteNavEmptyItemColor: '#999',

  // Button
  primaryButtonLabelColor: light100Color,
  primaryButtonBackgroundColor: primaryColor,
  secondaryButtonLabelColor: light100Color,
  secondaryButtonBackgroundColor: 'transparent',

  // Input
  inputBackground: light12Color,
}
