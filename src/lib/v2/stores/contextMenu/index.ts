import { useState, useCallback } from 'react'
import { ContextMenuContext, MenuItem } from './types'
import { createStoreContext } from '../../utils/context'
import { useCounter } from 'react-use'
export * from './types'

export const menuHeight = 26
export const menuMargin = 10
export const menuVerticalPadding = 6
export const menuZIndex = 9000

function useContextMenuStore(): ContextMenuContext {
  const [closed, setClosed] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [id, { inc: incrementId }] = useCounter(0)

  const popup = useCallback(
    (event: React.MouseEvent<Element>, menuItems: MenuItem[]) => {
      incrementId()
      setClosed(false)
      setMenuItems(menuItems)

      const currentTargetRect = event.currentTarget.getBoundingClientRect()

      const yPositionLimit =
        window.innerHeight -
        menuHeight * menuItems.length -
        menuMargin -
        menuVerticalPadding * 2
      const clientYIsLowerThanYPositionLimit =
        currentTargetRect.bottom > yPositionLimit

      const position = {
        // TODO: Limit xPosition
        x: currentTargetRect.left,
        y: clientYIsLowerThanYPositionLimit
          ? yPositionLimit
          : currentTargetRect.bottom,
      }
      setPosition(position)
    },
    [incrementId]
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
    close,
  }
}

export const {
  StoreProvider: V2ContextMenuProvider,
  useStore: useContextMenu,
} = createStoreContext(useContextMenuStore, 'contextMenu')
