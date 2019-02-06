import React from 'react'
import { computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import ContextMenuStore from '../../../lib/contextMenu/ContextMenuStore'
import { MenuTypes } from '../../../lib/contextMenu/interfaces'
import DialogStore from '../../../lib/dialog/DialogStore'
import { DialogIconTypes } from '../../../lib/dialog/interfaces'
import Storage from '../../../lib/db/Storage'
import FolderItem from './FolderItem'
import { Folder } from '../../../types'
import {
  StyledStorageItem,
  StyledStorageItemHeader,
  StyledNavLink,
  StyledStorageItemFolderList
} from './styled'

type StorageItemProps = {
  name: string
  storage: Storage
  removeStorage: (storageName: string) => Promise<void>
  createFolder: (storageName: string, folderPath: string) => Promise<void>
  removeFolder: (storageName: string, folderPath: string) => Promise<void>
  pathname: string
  active: boolean
  contextMenu?: ContextMenuStore
  dialog?: DialogStore
}

@inject('contextMenu', 'dialog')
@observer
class StorageItem extends React.Component<StorageItemProps> {
  @computed
  get tags(): string[] {
    const { storage } = this.props
    return [...storage.tagNoteIdSetMap.keys()].sort()
  }

  @computed
  get folders(): Folder[] {
    const { storage } = this.props
    const folderEntries = [...storage.folderMap.entries()]
    return folderEntries
      .map(([, folder]) => folder)
      .sort((folderA, folderB) => folderA.path.localeCompare(folderB.path))
  }

  removeStorage = () => {
    const { name, removeStorage } = this.props
    removeStorage(name)
  }

  createFolder = async (folderPath: string) => {
    const { name, createFolder } = this.props
    await createFolder(name, folderPath)
  }

  removeFolder = async (folderPath: string) => {
    const { name, removeFolder } = this.props
    await removeFolder(name, folderPath)
  }

  openContextMenu = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const { contextMenu, dialog, name } = this.props

    contextMenu!.open(event, [
      {
        type: MenuTypes.Normal,
        label: 'New Folder',
        onClick: async () => {
          dialog!.prompt({
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
          dialog!.messageBox({
            title: `Remove "${name}" storage`,
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
    const { name, pathname, active } = this.props

    return (
      <StyledStorageItem>
        <StyledStorageItemHeader onContextMenu={this.openContextMenu}>
          <StyledNavLink active={active} to={`/storages/${name}`}>
            {name}
          </StyledNavLink>
        </StyledStorageItemHeader>
        <StyledStorageItemFolderList>
          {this.folders.map(folder => {
            const folderPathname =
              folder.path === '/'
                ? `/storages/${name}/notes`
                : `/storages/${name}/notes${folder.path}`
            const folderIsActive = folderPathname === pathname

            return (
              <FolderItem
                key={folder.path}
                storageName={name}
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
            const tagIsActive = pathname === `/storages/${name}/tags/${tag}`
            return (
              <li key={tag}>
                <StyledNavLink
                  active={tagIsActive}
                  to={`/storages/${name}/tags/${tag}`}
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

export default StorageItem
