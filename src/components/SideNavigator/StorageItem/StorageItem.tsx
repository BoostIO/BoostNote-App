import React, { useMemo, useCallback } from 'react'
import { useContextMenu } from '../../../lib/contextMenu'
import { MenuTypes } from '../../../lib/contextMenu/types'
import { useDialog } from '../../../lib/dialog'
import { DialogIconTypes } from '../../../lib/dialog/types'
import FolderItem from './FolderItem'
import {
  StyledStorageItem,
  StyledStorageItemHeader,
  StyledNavLink,
  StyledStorageItemFolderList
} from './styled'
import { NoteStorage } from '../../../lib/db/types'
import { useRouter } from '../../../lib/router'

type StorageItemProps = {
  id: string
  storage: NoteStorage
  removeStorage: (storageName: string) => Promise<void>
  createFolder: (storageName: string, folderPath: string) => Promise<void>
  removeFolder: (storageName: string, folderPath: string) => Promise<void>
  pathname: string
  active: boolean
}

export default (props: StorageItemProps) => {
  const dialog = useDialog()
  const contextMenu = useContextMenu()
  const { id, storage, createFolder, removeStorage, active } = props
  const storageName = storage.name
  const { pathname } = useRouter()

  const { folderMap, tagMap } = storage

  const tags = useMemo(
    () => {
      return Object.keys(tagMap)
    },
    [tagMap]
  )
  const folders = useMemo(
    () => {
      return Object.values(folderMap)
    },
    [folderMap]
  )

  const openContextMenu = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()

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
                createFolder(id, value)
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
                  removeStorage(id)
                }
              }
            })
          }
        }
      ])
    },
    [contextMenu.popup, dialog.prompt, dialog.messageBox, storageName, id]
  )

  return (
    <StyledStorageItem>
      <StyledStorageItemHeader onContextMenu={openContextMenu}>
        <StyledNavLink active={active} href={`/storages/${storageName}`}>
          {storageName}
        </StyledNavLink>
      </StyledStorageItemHeader>
      <StyledStorageItemFolderList>
        {folders.map(folder => {
          const folderPathname =
            folder._id === '/'
              ? `/storages/${storageName}/notes`
              : `/storages/${storageName}/notes${folder._id}`
          const folderIsActive = folderPathname === pathname

          return (
            <FolderItem
              key={folder._id}
              storageName={storageName}
              folder={folder}
              createFolder={async () => {}}
              removeFolder={async () => {}}
              active={folderIsActive}
            />
          )
        })}
      </StyledStorageItemFolderList>
      <ul>
        {tags.map(tag => {
          const tagIsActive =
            pathname === `/storages/${storageName}/tags/${tag}`
          return (
            <li key={tag}>
              <StyledNavLink
                active={tagIsActive}
                href={`/storages/${storageName}/tags/${tag}`}
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
