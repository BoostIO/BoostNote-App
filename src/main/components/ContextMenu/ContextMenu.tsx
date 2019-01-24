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
  render() {
    const { isOpen: contextMenuIsOpen } = this.props.contextMenu!
    if (!contextMenuIsOpen) return null
    return (
      <StyledContextMenu>
        <StyledContextMenuItem>Test</StyledContextMenuItem>
      </StyledContextMenu>
    )
  }
}
