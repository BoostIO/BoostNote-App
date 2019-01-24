import React from 'react'
import { inject, observer } from 'mobx-react'
import ContextMenuStore from '../../stores/ContextMenuStore'
import { StyledContextMenu, StyledContextMenuItem } from './styled'

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

  closeContextMenu = (event: React.FocusEvent<unknown>) => {
    this.props.contextMenu!.close(event)
  }

  render() {
    const { isOpen: contextMenuIsOpen } = this.props.contextMenu!
    if (!contextMenuIsOpen) return null
    return (
      <StyledContextMenu
        tabIndex={-1}
        ref={this.menuRef}
        onBlur={this.closeContextMenu}
      >
        <StyledContextMenuItem>Test</StyledContextMenuItem>
      </StyledContextMenu>
    )
  }
}
