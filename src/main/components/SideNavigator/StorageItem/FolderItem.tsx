import React from 'react'
import { observer, inject } from 'mobx-react'
import { Folder } from '../../../types'
import { StyledStorageItemFolderItem, StyledNavLink } from './styled'
import ContextMenuStore from '../../../lib/contextMenu/ContextMenuStore'
import { MenuTypes } from '../../../lib/contextMenu/interfaces'
import DialogStore from '../../../lib/dialog/DialogStore'
import { DialogIconTypes } from '../../../lib/dialog/interfaces'

type FolderItemProps = {
  storageName: string
  folder: Folder
  createFolder: (folderPath: string) => Promise<void>
  removeFolder: (folderPath: string) => Promise<void>
  active: boolean
  contextMenu?: ContextMenuStore
  dialog?: DialogStore
}

@inject('contextMenu', 'dialog')
@observer
class FolderItem extends React.Component<FolderItemProps> {
  openContextMenu = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const {
      contextMenu,
      folder,
      removeFolder,
      dialog,
      createFolder
    } = this.props

    event.preventDefault()
    contextMenu!.open(event, [
      {
        type: MenuTypes.Normal,
        label: 'New Folder',
        onClick: async () => {
          dialog!.prompt({
            title: 'Create a Folder',
            message: 'Enter the path where do you want to create a folder',
            iconType: DialogIconTypes.Question,
            defaultValue: folder.path === '/' ? '/' : `${folder.path}/`,
            onClose: (value: string | null) => {
              if (value == null) return
              createFolder(value)
            }
          })
        }
      },
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
