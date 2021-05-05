import {
  mdiMouse,
  mdiSortAlphabeticalAscending,
  mdiSortAlphabeticalDescending,
  mdiSortClockAscending,
} from '@mdi/js'

export type SidebarState =
  | 'tree'
  | 'search'
  | 'timeline'
  | 'bookmarks'
  | 'import'
  | 'members'
  | 'settings'

export const defaultSidebarExpandedWidth = 250
export const maxSidebarExpandedWidth = 500
export const minSidebarExpandedWidth = 150

export type SidebarTreeSortingOrder = 'drag' | 'a-z' | 'z-a' | 'last-updated'

export const SidebarTreeSortingOrders = {
  lastUpdated: {
    value: 'last-updated',
    label: 'Last updated',
    icon: mdiSortClockAscending,
  },
  aZ: {
    value: 'a-z',
    label: 'Title A-Z',
    icon: mdiSortAlphabeticalAscending,
  },
  zA: {
    value: 'z-a',
    label: 'Title Z-A',
    icon: mdiSortAlphabeticalDescending,
  },
  dragDrop: {
    value: 'drag',
    label: 'Drag and drop',
    icon: mdiMouse,
  },
} as {
  [title: string]: {
    value: SidebarTreeSortingOrder
    label: string
    icon: string
  }
}
