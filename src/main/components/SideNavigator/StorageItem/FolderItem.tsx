import React from 'react'
import { Folder } from '../../../types'
import { StyledStorageItemFolderItem, StyledNavLink } from './styled'

type FolderItemProps = {
  storageName: string
  folder: Folder
  removeFolder: (folderPath: string) => Promise<void>
  active: boolean
}

const FolderItem = ({
  storageName,
  folder,
  removeFolder,
  active
}: FolderItemProps) => {
  return (
    <StyledStorageItemFolderItem>
      <StyledNavLink
        active={active}
        to={`/storages/${storageName}/notes${folder.path}`}
      >
        {folder.path}
      </StyledNavLink>
      <button onClick={() => removeFolder(folder.path)}>x</button>
    </StyledStorageItemFolderItem>
  )
}

export default FolderItem
