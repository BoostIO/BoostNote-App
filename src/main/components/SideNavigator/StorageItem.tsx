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
  active: boolean
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
    const { name, storage, pathname, active } = this.props
    const folderEntries = [...storage.folderMap.entries()]

    return (
      <li>
        <div>
          <NavLink active={active} to={`/storages/${name}`}>
            {name}
          </NavLink>
          <button onClick={this.removeStorage}>x</button>
          <ul>
            {folderEntries.map(([, folder]) => {
              const folderIsActive =
                `/storages/${name}/notes${folder.path}` === pathname
              return (
                <FolderItem
                  key={folder.path}
                  storageName={name}
                  folder={folder}
                  removeFolder={this.removeFolder}
                  active={folderIsActive}
                />
              )
            })}
          </ul>
          <FolderCreateForm createFolder={this.createFolder} />
        </div>
      </li>
    )
  }
}

export default StorageItem
