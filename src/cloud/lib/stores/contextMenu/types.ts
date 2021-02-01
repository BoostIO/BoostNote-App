export enum MenuTypes {
  Component = 'Component',
  Normal = 'Normal',
  Separator = 'Separator',
  Submenu = 'Submenu',
}

interface MenuItemBase {
  type: MenuTypes
  enabled?: boolean
  visible?: boolean
}

export interface NormalMenuItem extends MenuItemBase {
  type: MenuTypes.Normal
  icon?: React.ReactNode
  label: string | React.ReactNode
  onClick?: () => void
}

export interface SeparatorMenuItem extends MenuItemBase {
  type: MenuTypes.Separator
}

export interface ComponentMenuItem extends MenuItemBase {
  type: MenuTypes.Component
  component: React.ReactNode
}

export interface SubmenuMenuItem extends MenuItemBase {
  type: MenuTypes.Submenu
  submenu: MenuItem[]
}

export type MenuItem = NormalMenuItem | SeparatorMenuItem | ComponentMenuItem

export type Position = { x: number; y: number }

export interface ContextMenuContext {
  closed: boolean
  position: Position
  menuItems: MenuItem[]
  id: number
  popup(event: React.MouseEvent<unknown>, menuItems: MenuItem[]): void
  close(): void
}
