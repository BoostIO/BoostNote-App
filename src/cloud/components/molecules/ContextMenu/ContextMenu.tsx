import React, { useState, useEffect } from 'react'
import {
  StyledContextMenu,
  StyledContextMenuItem,
  StyledSeparator,
} from './styled'
import {
  useContextMenu,
  MenuTypes,
  NormalMenuItem,
} from '../../../lib/stores/contextMenu'
import { useEffectOnce } from 'react-use'

const ContextMenu = () => {
  const contextMenu = useContextMenu()
  const [windowWith, setWindowWidth] = useState(200)
  const menuRef: React.RefObject<HTMLDivElement> = React.createRef()

  useEffectOnce(() => {
    setWindowWidth(
      window.innerWidth ||
        innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
    )
  })

  useEffect(() => {
    if (!contextMenu.closed) {
      menuRef.current!.focus()
    }
  }, [contextMenu.closed, menuRef])

  const closeContextMenu = () => {
    contextMenu!.close()
  }

  const closeContextMenuIfMenuBlurred = (
    event: React.FocusEvent<HTMLDivElement>
  ) => {
    if (isMenuBlurred(event.relatedTarget)) {
      closeContextMenu()
    }
  }

  const isMenuBlurred = (relatedTarget: any): boolean => {
    if (menuRef.current == null) return true
    let currentTarget: HTMLElement | null | undefined = relatedTarget
    while (currentTarget != null) {
      if (currentTarget === menuRef.current) return false
      currentTarget = currentTarget.parentElement
    }
    return true
  }

  const { closed, menuItems, position, id } = contextMenu
  if (closed) return null

  return (
    <StyledContextMenu
      tabIndex={-1}
      ref={menuRef}
      onBlur={closeContextMenuIfMenuBlurred}
      style={{
        left: position.x + 130 < windowWith ? position.x : windowWith - 150,
        top: position.y,
      }}
    >
      {menuItems.map((menu, index) => {
        const key = `${id}-${index}`
        switch (menu.type) {
          case MenuTypes.Normal:
            const nMenu = {
              onClick: () => {
                return
              },
              ...(menu as NormalMenuItem),
            }
            return (
              <StyledContextMenuItem
                key={key}
                onClick={() => {
                  closeContextMenu()
                  nMenu.onClick()
                }}
                disabled={nMenu.enabled == null ? false : !nMenu.enabled}
              >
                {nMenu.icon}
                {nMenu.label}
              </StyledContextMenuItem>
            )
          case MenuTypes.Component:
            return <React.Fragment key={key}>{menu.component}</React.Fragment>
          case MenuTypes.Separator:
            return <StyledSeparator key={key} />
          default:
            return (
              <StyledContextMenuItem key={key}>
                Not implemented yet
              </StyledContextMenuItem>
            )
        }
      })}
    </StyledContextMenu>
  )
}

export default ContextMenu
