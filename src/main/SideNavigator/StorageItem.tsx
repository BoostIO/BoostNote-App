import React from 'react'
import Storage from '../stores/Storage'
import FolderItem from './FolderItem'

type StorageItemProps = {
  name: string
  storage: Storage
  removeStorage: (storageName: string) => Promise<void>
}

class StorageItem extends React.Component<StorageItemProps> {
  removeStorage = () => {
    const { name, removeStorage } = this.props
    removeStorage(name)
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
              <FolderItem folder={folder} />
            ))}
          </ul>
          <div>
            <label>New folder</label>
            <input />
            <button>Add</button>
          </div>
        </div>
      </li>
    )
  }
}

export default StorageItem
