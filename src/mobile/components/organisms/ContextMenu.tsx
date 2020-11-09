import React from 'react'
import {
  useContextMenu,
  MenuTypes,
  ContextMenuContext,
  menuVerticalPadding,
  menuZIndex,
} from '../../../mobile/lib/contextMenu'
import styled from '../../../lib/styled'
import {
  uiTextColor,
  contextMenuShadow,
  borderColor,
  backgroundColor,
  activeBackgroundColor,
  borderBottom,
} from '../../../lib/styled/styleFunctions'
import { keyframes } from 'styled-components'

const popupAnimation = keyframes`
  from {
    bottom: -100%;
  }

  to {
    bottom: 15px;
  }
`

const ContextMenuRoot = styled.div`
  position: fixed;
  margin: 0 auto;
  bottom: 15px;
  width: 100%;
  z-index: ${menuZIndex};
  outline: none;
  display: flex;
  justify-content: center;
  animation: ${popupAnimation} 200ms ease-in-out;
`

const ContextMenuContainer = styled.div`
  width: 100%;
  max-width: 320px;
  ${backgroundColor}
  ${borderColor}
  border-style: solid;
  border-width: 1px;
  padding: ${menuVerticalPadding}px 0;
  box-sizing: border-box;
  border-radius: 5px;
  ${contextMenuShadow}
`

const ContextMenuItem = styled.button`
  height: 44px;
  padding: 0 20px;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  display: block;
  width: 100%;
  font-size: 14px;
  text-align: center;
  ${uiTextColor};
  ${borderBottom}
  &:last-child {
    border-bottom: none;
  }
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

const SeparatorContextMenuItem = styled.div`
  height: 10px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.borderColor};
  border: none;
  width: 100%;
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
    const { closed, menuItems, id } = this.props.contextMenu

    if (closed) return null

    return (
      <ContextMenuRoot
        tabIndex={-1}
        ref={this.menuRef}
        onBlur={this.closeContextMenuIfMenuBlurred}
      >
        <ContextMenuContainer>
          {menuItems.map((menu, index) => {
            const key = `${id}-${index}`
            switch (menu.type) {
              case MenuTypes.Normal:
                return (
                  <ContextMenuItem
                    key={key}
                    onClick={() => {
                      this.closeContextMenu()
                      menu.onClick()
                    }}
                    disabled={menu.enabled == null ? false : !menu.enabled}
                  >
                    {menu.label}
                  </ContextMenuItem>
                )
              case MenuTypes.Separator:
                return <SeparatorContextMenuItem key={key} />
              default:
                return (
                  <ContextMenuItem key={key}>
                    Not implemented yet
                  </ContextMenuItem>
                )
            }
          })}
        </ContextMenuContainer>
      </ContextMenuRoot>
    )
  }
}
export default () => {
  const contextMenu = useContextMenu()
  return <ContextMenu contextMenu={contextMenu} />
}
