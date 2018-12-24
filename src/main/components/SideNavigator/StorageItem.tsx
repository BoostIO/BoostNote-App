import React from 'react'
import { computed } from 'mobx'
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
  @computed
  get tags(): string[] {
    const { storage } = this.props
    return [...storage.tagNoteIdSetMap.keys()]
  }

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
    const storagePathname = `/storages/${name}`
    const storageLinkIsActive = pathname === storagePathname

    return (
      <li>
        <div>
          <NavLink active={storageLinkIsActive} to={storagePathname}>
            {name}
          </NavLink>
          <button onClick={this.removeStorage}>x</button>
          <ul>
            {folderEntries.map(([, folder]) => {
              return (
                <FolderItem
                  key={folder.path}
                  pathname={pathname}
                  storageName={name}
                  folder={folder}
                  removeFolder={this.removeFolder}
                />
              )
            })}
          </ul>
          <FolderCreateForm createFolder={this.createFolder} />
          <ul>
            {this.tags.map(tag => {
              const tagIsActive = pathname === `/storages/${name}/tags/${tag}`
              return (
                <li key={tag}>
                  <NavLink
                    active={tagIsActive}
                    to={`/storages/${name}/tags/${tag}`}
                  >
                    {tag}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      </li>
    )
  }
}

export default StorageItem
