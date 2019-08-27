import React from 'react'
import { observer, inject } from 'mobx-react'
import { Folder } from '../../../types'
import { StyledStorageItemFolderItem, StyledNavLink } from './styled'
import ContextMenuStore from '../../../lib/contextMenu/ContextMenuStore'
import { MenuTypes } from '../../../lib/contextMenu/interfaces'
import { DialogContext, useDialog } from '../../../lib/dialog'
import { DialogIconTypes } from '../../../lib/dialog/types'

type FolderItemProps = {
  storageName: string
  folder: Folder
  createFolder: (folderPath: string) => Promise<void>
  removeFolder: (folderPath: string) => Promise<void>
  active: boolean
  contextMenu?: ContextMenuStore
  dialog?: DialogContext
}

@inject('contextMenu')
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

    const folderIsRootFolder = folder.path === '/'

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
            defaultValue: folderIsRootFolder ? '/' : `${folder.path}/`,
            submitButtonLabel: 'Create Folder',
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
        enabled: !folderIsRootFolder,
        onClick: () => {
          dialog!.messageBox({
            title: `Remove "${folder.path}" folder`,
            message: 'All notes and subfolders will be deleted.',
            iconType: DialogIconTypes.Warning,
            buttons: ['Remove Folder', 'Cancel'],
            defaultButtonIndex: 0,
            cancelButtonIndex: 1,
            onClose: (value: number | null) => {
              if (value === 0) {
                removeFolder(folder.path)
              }
            }
          })
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

export default (props: FolderItemProps) => {
  const dialog = useDialog()
  return <FolderItem {...props} dialog={dialog} />
}
