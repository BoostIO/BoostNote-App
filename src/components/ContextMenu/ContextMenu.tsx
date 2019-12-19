import React from 'react'
import { StyledContextMenu, StyledContextMenuItem } from './styled'
import {
  useContextMenu,
  MenuTypes,
  ContextMenuContext
} from '../../lib/contextMenu'

interface ContextMenuProps {
  contextMenu: ContextMenuContext
}

class ContextMenu extends React.Component<ContextMenuProps> {
  menuRef: React.RefObject<HTMLDivElement> = React.createRef()

  componentDidUpdate() {
    if (!this.props.contextMenu.closed) this.menuRef.current!.focus()
  }

  closeContextMenu() {
    this.props.contextMenu!.close()
  }

  closeContextMenuIfMenuBlurred = (event: React.FocusEvent<HTMLDivElement>) => {
    if (this.isMenuBlurred(event.relatedTarget)) {
      this.closeContextMenu()
    }
  }

  isMenuBlurred(relatedTarget: any): boolean {
    if (this.menuRef.current == null) return true
    let currentTarget: HTMLElement | null | undefined = relatedTarget
    while (currentTarget != null) {
      if (currentTarget === this.menuRef.current) return false
      currentTarget = currentTarget.parentElement
    }
    return true
  }

  render() {
    const { closed, menuItems, position, id } = this.props.contextMenu
    const windowWith =
      window.innerWidth ||
      innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth

    if (closed) return null
    return (
      <StyledContextMenu
        tabIndex={-1}
        ref={this.menuRef}
        onBlur={this.closeContextMenuIfMenuBlurred}
        style={{
          left: position.x + 130 < windowWith ? position.x : windowWith - 150,
          top: position.y
        }}
      >
        {menuItems.map((menu, index) => {
          const key = `${id}-${index}`
          switch (menu.type) {
            case MenuTypes.Normal:
              return (
                <StyledContextMenuItem
                  key={key}
                  onClick={() => {
                    this.closeContextMenu()
                    menu.onClick()
                  }}
                  disabled={menu.enabled == null ? false : !menu.enabled}
                >
                  {menu.label}
                </StyledContextMenuItem>
              )
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
}
export default () => {
  const contextMenu = useContextMenu()
  return <ContextMenu contextMenu={contextMenu} />
}
