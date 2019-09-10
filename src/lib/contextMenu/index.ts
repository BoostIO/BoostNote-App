import { useState, useCallback } from 'react'
import { createStoreContext } from '../utils/context'
import { ContextMenuContext, MenuItem } from './types'
export * from './types'

export const menuHeight = 19
export const menuMargin = 5
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
