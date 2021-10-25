import { SidebarState } from '../../../../design/lib/sidebar'
import { SidebarTreeSortingOrder } from '../../../../design/lib/sidebar'
import { DocStatus } from '../../../interfaces/db/doc'

export type LayoutMode = 'split' | 'preview' | 'editor'

export interface Preferences {
  docContextMode: 'hidden' | 'comment'
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
  version?: number
  docStatusDisplayed: DocStatus[]
  docPropertiesAreHidden: boolean
}
