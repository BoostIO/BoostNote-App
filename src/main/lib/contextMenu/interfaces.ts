export enum MenuTypes {
  Normal = 'Normal',
  Separator = 'Separator',
  Submenu = 'Submenu',
  // TODO: Implement later
  Checkbox = 'Checkbox',
  Radio = 'Radio'
}

interface MenuItemBase {
  type: MenuTypes
  enabled?: boolean
  visible?: boolean
}

export interface NormalMenuItem extends MenuItemBase {
  type: MenuTypes.Normal
  icon?: string
  label: string
  onClick: () => void
}

export interface SeparatorMenuItem extends MenuItemBase {
  type: MenuTypes.Separator
}

export interface SubmenuMenuItem extends MenuItemBase {
  type: MenuTypes.Submenu
  submenu: MenuItem[]
}

export type MenuItem = NormalMenuItem | SeparatorMenuItem
