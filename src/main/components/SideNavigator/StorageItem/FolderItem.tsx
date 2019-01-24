import React from 'react'
import { observer, inject } from 'mobx-react'
import { Folder } from '../../../types'
import { StyledStorageItemFolderItem, StyledNavLink } from './styled'
import ContextMenuStore from '../../../stores/ContextMenuStore'

type FolderItemProps = {
  storageName: string
  folder: Folder
  removeFolder: (folderPath: string) => Promise<void>
  active: boolean
  contextMenu?: ContextMenuStore
}

const FolderItem = inject('contextMenu')(
  observer(
    ({
      storageName,
      folder,
      removeFolder,
      active,
      contextMenu
    }: FolderItemProps) => {
      return (
        <StyledStorageItemFolderItem>
          <StyledNavLink
            active={active}
            to={`/storages/${storageName}/notes${folder.path}`}
            onContextMenu={event => {
              event.preventDefault()
              contextMenu!.open(event, [])
            }}
          >
            {folder.path}
          </StyledNavLink>
          <button onClick={() => removeFolder(folder.path)}>x</button>
        </StyledStorageItemFolderItem>
      )
    }
  )
)

export default FolderItem
