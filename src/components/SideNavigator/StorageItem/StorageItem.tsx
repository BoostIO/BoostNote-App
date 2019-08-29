import React from 'react'
import { computed } from 'mobx'
import { useContextMenu, ContextMenuContext } from '../../../lib/contextMenu'
import { MenuTypes } from '../../../lib/contextMenu/types'
import { DialogContext, useDialog } from '../../../lib/dialog'
import { DialogIconTypes } from '../../../lib/dialog/types'
import FolderItem from './FolderItem'
import { Folder } from '../../../types'
import {
  StyledStorageItem,
  StyledStorageItemHeader,
  StyledNavLink,
  StyledStorageItemFolderList
} from './styled'
import { Except } from 'type-fest'
import { NoteStorage } from '../../../lib/db/types'

type StorageItemProps = {
  id: string
  storage: NoteStorage
  removeStorage: (storageName: string) => Promise<void>
  createFolder: (storageName: string, folderPath: string) => Promise<void>
  removeFolder: (storageName: string, folderPath: string) => Promise<void>
  pathname: string
  active: boolean
  contextMenu: ContextMenuContext
  dialog: DialogContext
}

class StorageItem extends React.Component<StorageItemProps> {
  @computed
  get tags(): string[] {
    return []
  }

  @computed
  get folders(): Folder[] {
    return []
  }

  removeStorage = () => {
    const { id, removeStorage } = this.props
    removeStorage(id)
  }

  createFolder = async (folderPath: string) => {
    const { id, createFolder } = this.props
    await createFolder(id, folderPath)
  }

  removeFolder = async (folderPath: string) => {
    const { id, removeFolder } = this.props
    await removeFolder(id, folderPath)
  }

  openContextMenu = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const { contextMenu, dialog, storage } = this.props
    const storageName = storage.name

    contextMenu.popup(event, [
      {
        type: MenuTypes.Normal,
        label: 'New Folder',
        onClick: async () => {
          dialog.prompt({
            title: 'Create a Folder',
            message: 'Enter the path where do you want to create a folder',
            iconType: DialogIconTypes.Question,
            defaultValue: '/',
            submitButtonLabel: 'Create Folder',
            onClose: (value: string | null) => {
              if (value == null) return
              this.createFolder(value)
            }
          })
        }
      },
      {
        type: MenuTypes.Normal,
        label: 'Remove Storage',
        onClick: async () => {
          dialog.messageBox({
            title: `Remove "${storageName}" storage`,
            message: 'All notes and folders will be deleted.',
            iconType: DialogIconTypes.Warning,
            buttons: ['Remove Storage', 'Cancel'],
            defaultButtonIndex: 0,
            cancelButtonIndex: 1,
            onClose: (value: number | null) => {
              if (value === 0) {
                this.removeStorage()
              }
            }
          })
        }
      }
    ])
  }

  render() {
    const { storage, pathname, active } = this.props
    const storageName = storage.name

    return (
      <StyledStorageItem>
        <StyledStorageItemHeader onContextMenu={this.openContextMenu}>
          <StyledNavLink active={active} to={`/storages/${storageName}`}>
            {storageName}
          </StyledNavLink>
        </StyledStorageItemHeader>
        <StyledStorageItemFolderList>
          {this.folders.map(folder => {
            const folderPathname =
              folder.path === '/'
                ? `/storages/${storageName}/notes`
                : `/storages/${storageName}/notes${folder.path}`
            const folderIsActive = folderPathname === pathname

            return (
              <FolderItem
                key={folder.path}
                storageName={storageName}
                folder={folder}
                createFolder={this.createFolder}
                removeFolder={this.removeFolder}
                active={folderIsActive}
              />
            )
          })}
        </StyledStorageItemFolderList>
        <ul>
          {this.tags.map(tag => {
            const tagIsActive =
              pathname === `/storages/${storageName}/tags/${tag}`
            return (
              <li key={tag}>
                <StyledNavLink
                  active={tagIsActive}
                  to={`/storages/${storageName}/tags/${tag}`}
                >
                  {tag}
                </StyledNavLink>
              </li>
            )
          })}
        </ul>
      </StyledStorageItem>
    )
  }
}

export default (props: Except<StorageItemProps, 'dialog' | 'contextMenu'>) => {
  const dialog = useDialog()
  const contextMenu = useContextMenu()
  return <StorageItem {...props} dialog={dialog} contextMenu={contextMenu} />
}
