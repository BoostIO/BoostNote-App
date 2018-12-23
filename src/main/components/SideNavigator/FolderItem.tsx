import React from 'react'
import { Folder } from '../../types'
import NavLink from './NavLink'

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
    <li>
      <NavLink
        active={active}
        to={`/storages/${storageName}/notes${folder.path}`}
      >
        {folder.path}
      </NavLink>
      <button onClick={() => removeFolder(folder.path)}>x</button>
    </li>
  )
}

export default FolderItem
