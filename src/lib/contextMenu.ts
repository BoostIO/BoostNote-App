import { useState, useCallback } from 'react'
import { createStoreContext } from './context'

export enum MenuTypes {
  Normal = 'Normal',
  Separator = 'Separator',
  Submenu = 'Submenu',
  // TODO: Implement later
  Checkbox = 'Checkbox',
  Radio = 'Radio',
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
  popupWithPosition(
    position: { x: number; y: number },
    menuItems: MenuItem[]
  ): void
  close(): void
}

export const menuHeight = 24
export const menuSeparatorHeight = 12
export const menuMargin = 10
export const menuVerticalPadding = 4
export const menuZIndex = 9000

function useContextMenuStore(): ContextMenuContext {
  const [closed, setClosed] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [id, setId] = useState(0)

  const popupWithPosition = useCallback(
    ({ x, y }: { x: number; y: number }, menuItems: MenuItem[]) => {
      setId(id + 1)
      setClosed(false)
      setMenuItems(menuItems)

      const menuContentHeight = menuItems.reduce((height, menuItem) => {
        const menuItemHeight =
          menuItem.type === MenuTypes.Separator
            ? menuSeparatorHeight
            : menuHeight
        return height + menuItemHeight
      }, 0)

      const yPositionLimit =
        window.innerHeight -
        menuContentHeight -
        menuMargin -
        menuVerticalPadding * 2
      const clientYIsLowerThanYPositionLimit = y > yPositionLimit

      const position = {
        // TODO: Limit xPosition
        x,
        y: clientYIsLowerThanYPositionLimit ? yPositionLimit : y,
      }
      setPosition(position)
    },
    [id]
  )

  const popup = useCallback(
    (event: React.MouseEvent<unknown>, menuItems: MenuItem[]) => {
      popupWithPosition({ x: event.clientX, y: event.clientY }, menuItems)
    },
    [popupWithPosition]
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
    popupWithPosition,
    popup,
    close,
  }
}

export const {
  StoreProvider: ContextMenuProvider,
  useStore: useContextMenu,
} = createStoreContext(useContextMenuStore, 'context menu')
