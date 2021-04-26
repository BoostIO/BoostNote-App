import { useState, useCallback } from 'react'
import {
  ContextMenuContext,
  getContextPositionFromDomElement,
  MenuItem,
} from './types'
import { createStoreContext } from '../../utils/context'
import { useCounter } from 'react-use'
export * from './types'

function useContextMenuStore(): ContextMenuContext {
  const [closed, setClosed] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [id, { inc: incrementId }] = useCounter(0)

  const popup = useCallback(
    (event: React.MouseEvent<Element>, menuItems: MenuItem[]) => {
      incrementId()
      setMenuItems(menuItems)
      setPosition(getContextPositionFromDomElement(event, menuItems.length))
      setClosed(false)
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
