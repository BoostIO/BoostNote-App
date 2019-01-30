import React from 'react'
import { inject, observer } from 'mobx-react'
import ContextMenuStore from '../../lib/contextMenu/ContextMenuStore'
import { StyledContextMenu, StyledContextMenuItem } from './styled'
import { MenuTypes } from '../../lib/contextMenu/interfaces'

interface ContextMenuProps {
  contextMenu?: ContextMenuStore
}

@inject('contextMenu')
@observer
export default class ContextMenu extends React.Component<ContextMenuProps> {
  menuRef: React.RefObject<HTMLDivElement> = React.createRef()

  componentDidUpdate() {
    if (this.props.contextMenu!.isOpen) this.menuRef.current!.focus()
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
    const {
      isOpen: contextMenuIsOpen,
      menuItems,
      xPosition,
      yPosition,
      id
    } = this.props.contextMenu!
    if (!contextMenuIsOpen) return null
    return (
      <StyledContextMenu
        tabIndex={-1}
        ref={this.menuRef}
        onBlur={this.closeContextMenuIfMenuBlurred}
        style={{
          left: xPosition,
          top: yPosition
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
