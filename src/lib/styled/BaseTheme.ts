export interface BaseTheme {
  colors: any

  // General
  textColor: string
  uiTextColor: string
  disabledUiTextColor: string

  primaryColor: string
  borderColor: string
  iconColor: string
  activeIconColor: string
  noteListIconColor: string
  noteListActiveIconColor: string
  noteDetailIconColor: string
  noteDetailActiveIconColor: string
  closeIconColor: string
  closeActiveIconColor: string
  backgroundColor: string
  secondaryBackgroundColor: string
  activeBackgroundColor: string
  shadow: string
  scrollBarTrackColor: string
  scrollBarThumbColor: string

  // SideBar
  sideNavBackgroundColor: string
  sideNavLabelColor: string
  sideNavButtonColor: string
  sideNavButtonHoverColor: string
  sideNavButtonActiveColor: string
  sideNavItemColor: string
  sideNavItemBackgroundColor: string
  sideNavItemHoverBackgroundColor: string
  sideNavItemActiveColor: string
  sideNavItemActiveBackgroundColor: string
  sideNavItemHoverActiveBackgroundColor: string

  // Button
  primaryButtonLabelColor: string
  primaryButtonBackgroundColor: string
  secondaryButtonLabelColor: string
  secondaryButtonBackgroundColor: string

  // Input
  inputBackground: string
}
