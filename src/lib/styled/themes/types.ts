export interface BaseTheme {
  colors: any
  fontSize: number
  fontFamily: string

  // General
  textColor: string
  uiTextColor: string
  activeUiTextColor: string
  disabledUiTextColor: string

  primaryColor: string
  borderColor: string
  iconColor: string
  activeIconColor: string
  backgroundColor: string
  secondaryBackgroundColor: string
  activeBackgroundColor: string
  shadow: string
  scrollBarTrackColor: string
  scrollBarThumbColor: string

  // SideBar
  sideBarBackgroundColor: string
  sideBarTextColor: string
  sideBarSecondaryTextColor: string

  // Button
  primaryButtonLabelColor: string
  primaryButtonBackgroundColor: string
  secondaryButtonLabelColor: string
  secondaryButtonBackgroundColor: string

  // Input
  inputBackground: string
}
