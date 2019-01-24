import React from 'react'
import { observer, inject } from 'mobx-react'
import { Folder } from '../../../types'
import { StyledStorageItemFolderItem, StyledNavLink } from './styled'
import ContextMenuStore from '../../../stores/ContextMenuStore'
import { MenuTypes } from '../../../lib/contextMenu/interfaces'

type FolderItemProps = {
  storageName: string
  folder: Folder
  removeFolder: (folderPath: string) => Promise<void>
  active: boolean
  contextMenu?: ContextMenuStore
}

@inject('contextMenu')
@observer
class FolderItem extends React.Component<FolderItemProps> {
  openContextMenu = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const { contextMenu, folder, removeFolder } = this.props

    event.preventDefault()
    contextMenu!.open(event, [
      {
        type: MenuTypes.Normal,
        label: 'Remove Folder',
        onClick: () => {
          removeFolder(folder.path)
        }
      }
    ])
  }

  render() {
    const { storageName, folder, active } = this.props

    return (
      <StyledStorageItemFolderItem>
        <StyledNavLink
          active={active}
          to={`/storages/${storageName}/notes${folder.path}`}
          onContextMenu={this.openContextMenu}
        >
          {folder.path}
        </StyledNavLink>
      </StyledStorageItemFolderItem>
    )
  }
}

export default FolderItem
