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

export type Position = { x: number; y: number }

export interface ContextMenuContext {
  closed: boolean
  position: Position
  menuItems: MenuItem[]
  id: number
  popup(event: React.MouseEvent<unknown>, menuItems: MenuItem[]): void
  close(): void
}
