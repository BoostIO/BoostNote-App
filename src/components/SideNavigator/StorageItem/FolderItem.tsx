import React, { useCallback } from 'react'
import { StyledStorageItemFolderItem, StyledNavLink } from './styled'
import { useContextMenu } from '../../../lib/contextMenu'
import { MenuTypes } from '../../../lib/contextMenu/types'
import { useDialog } from '../../../lib/dialog'
import { DialogIconTypes } from '../../../lib/dialog/types'
import { PopulatedFolderDoc } from '../../../lib/db/types'

type FolderItemProps = {
  storageId: string
  folder: PopulatedFolderDoc
  createFolder: (storageId: string, folderPath: string) => Promise<void>
  removeFolder: (storageId: string, folderPath: string) => Promise<void>
  active: boolean
}

export default (props: FolderItemProps) => {
  const { prompt, messageBox } = useDialog()
  const contextMenu = useContextMenu()
  const { storageId, folder, active, removeFolder, createFolder } = props
  const openContextMenu = useCallback(
    (event: React.MouseEvent<HTMLLIElement>) => {
      const folderIsRootFolder = folder.pathname === '/'

      event.preventDefault()
      contextMenu.popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'New Folder',
          onClick: async () => {
            prompt({
              title: 'Create a Folder',
              message: 'Enter the path where do you want to create a folder',
              iconType: DialogIconTypes.Question,
              defaultValue: folderIsRootFolder ? '/' : `${folder.pathname}/`,
              submitButtonLabel: 'Create Folder',
              onClose: (value: string | null) => {
                if (value == null) return
                createFolder(storageId, value)
              }
            })
          }
        },
        {
          type: MenuTypes.Normal,
          label: 'Remove Folder',
          enabled: !folderIsRootFolder,
          onClick: () => {
            messageBox({
              title: `Remove "${folder.pathname}" folder`,
              message: 'All notes and subfolders will be deleted.',
              iconType: DialogIconTypes.Warning,
              buttons: ['Remove Folder', 'Cancel'],
              defaultButtonIndex: 0,
              cancelButtonIndex: 1,
              onClose: (value: number | null) => {
                if (value === 0) {
                  removeFolder(storageId, folder.pathname)
                }
              }
            })
          }
        }
      ])
    },
    [
      folder.pathname,
      prompt,
      messageBox,
      contextMenu,
      createFolder,
      storageId,
      removeFolder
    ]
  )

  return (
    <StyledStorageItemFolderItem onContextMenu={openContextMenu}>
      <StyledNavLink
        active={active}
        href={`/app/storages/${storageId}/notes${folder.pathname}`}
      >
        {folder.pathname}
      </StyledNavLink>
    </StyledStorageItemFolderItem>
  )
}
