import { LayoutMode } from '../../../components/layouts/DocEditLayout'

export interface Preferences {
  docContextIsHidden: boolean
  sidebarIsHidden: boolean
  sidebarIsHovered: boolean
  sideBarWidth: number
  lastUsedLayout: LayoutMode
  workspaceManagerIsOpen: boolean
  sidebarBookmarksAreUnfolded: boolean
}
