export interface BaseTheme {
  colors: any

  // General
  textColor: string
  uiTextColor: string
  disabledUiTextColor: string

  primaryColor: string
  primaryDarkerColor: string
  dangerColor: string
  borderColor: string

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

  // NotePage
  noteNavEmptyItemColor: string

  // Button
  primaryButtonLabelColor: string
  primaryButtonBackgroundColor: string
  primaryButtonHoverBackgroundColor: string
  secondaryButtonLabelColor: string
  secondaryButtonBackgroundColor: string
  secondaryButtonHoverBackgroundColor: string

  // Input
  inputBackground: string
}
