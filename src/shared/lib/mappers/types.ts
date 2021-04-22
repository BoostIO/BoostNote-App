export interface BreadCrumbTreeItem {
  id: string
  parentId?: string
  label: string
  defaultIcon?: string
  emoji?: string
  active?: boolean
  link: {
    href: string
    navigateTo: () => void
  }
}

export interface ContentManagerItemProps<T> {
  id: string
  label: string
  href: string
  category: T
  lastUpdated: string
  controls: []
  lastUpdatedBy?: string[]
  badges?: string[]
}
