import React from 'react'
import {
  useContextMenu,
  MenuTypes,
  ContextMenuContext
} from '../../lib/contextMenu'
import styled from '../../lib/styled'
import {
  menuHeight,
  menuVerticalPadding,
  menuZIndex
} from '../../lib/contextMenu'
import {
  uiTextColor,
  contextMenuShadow,
  borderColor,
  backgroundColor,
  activeBackgroundColor
} from '../../lib/styled/styleFunctions'

const StyledContextMenu = styled.div`
  min-width: 130px;
  position: fixed;
  z-index: ${menuZIndex};
  ${backgroundColor}
  ${borderColor}
  border-style: solid;
  border-width: 1px;
  padding: ${menuVerticalPadding}px 0;
  font-size: 14px;
  box-sizing: border-box;
  border-radius: 2px;
  ${contextMenuShadow}
  outline: none;
`

const StyledContextMenuItem = styled.button`
  height: ${menuHeight}px;
  padding: 0 20px;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  display: block;
  width: 100%;
  text-align: left;
  ${uiTextColor};
  &:hover,
  &:focus,
  &:active,
  &.active {
    ${activeBackgroundColor}
  }
  &:disabled {
    background-color: transparent;
  }
`

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
