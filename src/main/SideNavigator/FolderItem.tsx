import React from 'react'
import { Folder } from '../lib/db/dataTypes'

type FolderItemProps = {
  folder: Folder
}

const FolderItem = ({ folder }: FolderItemProps) => <li>{folder.path}</li>

export default FolderItem
