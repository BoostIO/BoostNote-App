import React from 'react'
import { Folder } from '../lib/db/dataTypes'

type FolderItemProps = {
  folder: Folder
  removeFolder: (folderPath: string) => Promise<void>
}

const FolderItem = ({ folder, removeFolder }: FolderItemProps) => (
  <li>
    <button>{folder.path}</button>
    <button onClick={() => removeFolder(folder.path)}>x</button>
  </li>
)

export default FolderItem
