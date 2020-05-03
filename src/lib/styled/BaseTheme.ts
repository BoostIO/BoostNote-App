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
  navBackgroundColor: string
  navLabelColor: string
  navButtonColor: string
  navButtonHoverColor: string
  navButtonActiveColor: string
  navItemColor: string
  navItemBackgroundColor: string
  navItemHoverBackgroundColor: string
  navItemActiveColor: string
  navItemActiveBackgroundColor: string
  navItemHoverActiveBackgroundColor: string

  // Button
  primaryButtonLabelColor: string
  primaryButtonBackgroundColor: string
  secondaryButtonLabelColor: string
  secondaryButtonBackgroundColor: string

  // Input
  inputBackground: string
}
