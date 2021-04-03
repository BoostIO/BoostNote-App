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
