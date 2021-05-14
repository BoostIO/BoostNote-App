import { SidebarState } from '../../../../shared/lib/sidebar'
import { LayoutMode } from '../../../components/layouts/DocEditLayout'
import { SidebarTreeSortingOrder } from '../../../../shared/lib/sidebar'

export interface Preferences {
  docContextIsHidden: boolean
  sidebarIsHidden: boolean
  sidebarIsHovered: boolean
  sideBarWidth: number
  lastEditorMode: 'edit' | 'preview'
  lastEditorEditLayout: LayoutMode
  workspaceManagerIsOpen: boolean
  sidebarBookmarksAreUnfolded: boolean
  lastSidebarState: SidebarState | undefined
  sidebarTreeSortingOrder: SidebarTreeSortingOrder
  sidebarOrderedCategories: string
}
