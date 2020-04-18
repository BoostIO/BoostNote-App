import { BaseTheme } from '../lib/styled/BaseTheme'

const base1Color = '#ECECEC'
const base2Color = '#F9F9F9'
const primaryColor = '#02A47E'

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
    border: dark12Color,
  },

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
  sideNavBackgroundColor: '#fff',
  sideNavLabelColor: '#555',
  sideNavButtonColor: '#777',
  sideNavButtonHoverColor: '#555',
  sideNavButtonActiveColor: primaryColor,
  sideNavItemColor: '#555',
  sideNavItemBackgroundColor: 'transparent',
  sideNavItemHoverBackgroundColor: '#eee',
  sideNavItemActiveColor: '#111',
  sideNavItemActiveBackgroundColor: '#eee',
  sideNavItemHoverActiveBackgroundColor: '#e0e0e0',

  // Button
  primaryButtonLabelColor: light100Color,
  primaryButtonBackgroundColor: primaryColor,
  secondaryButtonLabelColor: dark100Color,
  secondaryButtonBackgroundColor: 'transparent',

  // Input
  inputBackground: dark12Color,
}
