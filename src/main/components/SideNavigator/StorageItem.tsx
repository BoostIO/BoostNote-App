import React from 'react'
import { observer } from 'mobx-react'
import Storage from '../../stores/Storage'
import FolderItem from './FolderItem'
import FolderCreateForm from './FolderCreateForm'
import NavLink from './NavLink'

type StorageItemProps = {
  name: string
  storage: Storage
  removeStorage: (storageName: string) => Promise<void>
  createFolder: (storageName: string, folderPath: string) => Promise<void>
  removeFolder: (storageName: string, folderPath: string) => Promise<void>
  pathname: string
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

  removeFolder = async (folderPath: string) => {
    const { name, removeFolder } = this.props
    await removeFolder(name, folderPath)
  }

  render() {
    const { name, storage, pathname } = this.props
    const folderEntries = [...storage.folderMap.entries()]
    const storageLinkIsActive = pathname === `/storages/${name}`

    return (
      <li>
        <div>
          <NavLink active={storageLinkIsActive} to={`/storages/${name}`}>
            {name}
          </NavLink>
          <button onClick={this.removeStorage}>x</button>
          <ul>
            {folderEntries.map(([, folder]) => (
              <FolderItem
                key={folder.path}
                folder={folder}
                removeFolder={this.removeFolder}
              />
            ))}
          </ul>
          <FolderCreateForm createFolder={this.createFolder} />
        </div>
      </li>
    )
  }
}

export default StorageItem
