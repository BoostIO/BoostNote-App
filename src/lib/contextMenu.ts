import { useState, useCallback } from 'react'
import { createStoreContext } from './context'

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

export const menuHeight = 26
export const menuMargin = 10
export const menuVerticalPadding = 4
export const menuZIndex = 9000

function useContextMenuStore(): ContextMenuContext {
  const [closed, setClosed] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [id, setId] = useState()

  const popup = useCallback(
    (event: React.MouseEvent<unknown>, menuItems: MenuItem[]) => {
      setId(id + 1)
      setClosed(false)
      setMenuItems(menuItems)

      const yPositionLimit =
        window.innerHeight -
        menuHeight * menuItems.length -
        menuMargin -
        menuVerticalPadding * 2
      const clientYIsLowerThanYPositionLimit = event.clientY > yPositionLimit

      const position = {
        // TODO: Limit xPosition
        x: event.clientX,
        y: clientYIsLowerThanYPositionLimit ? yPositionLimit : event.clientY
      }
      setPosition(position)
    },
    [id]
  )

  const close = useCallback(() => {
    setClosed(true)
    setMenuItems([])
  }, [])

  return {
    closed,
    position,
    menuItems,
    id,
    popup,
    close
  }
}

export const {
  StoreProvider: ContextMenuProvider,
  useStore: useContextMenu
} = createStoreContext(useContextMenuStore, 'context menu')
