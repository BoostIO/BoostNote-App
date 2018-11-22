import React from 'react'
import { Folder } from '../../types'
import NavLink from './NavLink'

type FolderItemProps = {
  pathname: string
  storageName: string
  folder: Folder
  removeFolder: (folderPath: string) => Promise<void>
}

const FolderItem = ({
  pathname,
  storageName,
  folder,
  removeFolder
}: FolderItemProps) => {
  const folderPathname = `/storages/${storageName}/notes${folder.path}`
  const folderLinkIsActive = pathname === folderPathname
  return (
    <li>
      <NavLink active={folderLinkIsActive} to={folderPathname}>
        {folder.path}
      </NavLink>
      <button onClick={() => removeFolder(folder.path)}>x</button>
    </li>
  )
}

export default FolderItem
