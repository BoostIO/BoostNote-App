import { SidebarState } from '../../../../shared/lib/sidebar'
import { LayoutMode } from '../../../components/layouts/DocEditLayout'
import { SidebarTreeSortingOrder } from '../../../../shared/lib/sidebar'

export interface Preferences {
  docContextMode: 'hidden' | 'context' | 'comment'
  sidebarIsHidden: boolean
  sidebarIsHovered: boolean
  sideBarWidth: number
  lastEditorMode: 'edit' | 'preview'
  lastEditorEditLayout: LayoutMode
  workspaceManagerIsOpen: boolean
  lastSidebarState: SidebarState | undefined
  sidebarTreeSortingOrder: SidebarTreeSortingOrder
  sidebarOrderedCategories: string
  folderSortingOrder: 'Latest Updated' | 'Title A-Z' | 'Title Z-A'
}
