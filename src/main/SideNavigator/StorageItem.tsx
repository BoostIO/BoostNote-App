import React from 'react'
import { observer } from 'mobx-react'
import Storage from '../stores/Storage'
import FolderItem from './FolderItem'
import FolderCreateForm from './FolderCreateForm'

type StorageItemProps = {
  name: string
  storage: Storage
  removeStorage: (storageName: string) => Promise<void>
  createFolder: (storageName: string, folderPath: string) => Promise<void>
}

@observer
class StorageItem extends React.Component<StorageItemProps> {
  removeStorage = () => {
    const { name, removeStorage } = this.props
    removeStorage(name)
  }

  createFolder = async (folderPath: string) => {
    const { name, createFolder } = this.props
    await createFolder(name, folderPath)
  }

  render() {
    const { name, storage } = this.props
    const folderEntries = [...storage.folderMap.entries()]

    return (
      <li>
        <div>
          {name}
          <button onClick={this.removeStorage}>x</button>
          <ul>
            {folderEntries.map(([, folder]) => (
              <FolderItem key={folder.path} folder={folder} />
            ))}
          </ul>
          <FolderCreateForm createFolder={this.createFolder} />
        </div>
      </li>
    )
  }
}

export default StorageItem
