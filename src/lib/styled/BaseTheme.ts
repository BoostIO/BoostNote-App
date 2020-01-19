export interface BaseTheme {
  colors: any
  fontSize: number
  fontFamily: string

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
  sideBarBackgroundColor: string
  sideBarTextColor: string
  activeSideBarSecondaryTextColor: string
  sideBarSecondaryTextColor: string

  // Button
  primaryButtonLabelColor: string
  primaryButtonBackgroundColor: string
  secondaryButtonLabelColor: string
  secondaryButtonBackgroundColor: string

  // Input
  inputBackground: string
}
