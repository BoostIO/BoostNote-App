// import { BaseTheme } from '../../cloud/lib/styled/themes/types'

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
  noteNavItemBackgroundColor: string

  // Team Switcher
  teamSwitcherBackgroundColor: string
  teamSwitcherBorderColor: string
  teamSwitcherTextColor: string
  teamSwitcherHoverBackgroundColor: string
  teamSwitcherHoverTextColor: string

  // Button
  primaryButtonLabelColor: string
  primaryButtonBackgroundColor: string
  primaryButtonHoverBackgroundColor: string
  secondaryButtonLabelColor: string
  secondaryButtonHoverLabelColor: string
  secondaryButtonBackgroundColor: string
  secondaryButtonHoverBackgroundColor: string

  // Input
  inputBackground: string

  // Search Highlight
  searchHighlightBackgroundColor: string
  searchHighlightSubtleBackgroundColor: string
  searchItemSelectionTextColor: string
  searchItemSelectionBackgroundColor: string
  searchItemSelectionHoverBackgroundColor: string
  searchHighlightTextColor: string

  // Local Search
  searchSecondaryBackgroundColor: string

  // Tooltip
  tooltipBackgroundColor: string
  tooltipTextColor: string
}

// export type V2BaseTheme = BaseThemeLocal & BaseTheme
