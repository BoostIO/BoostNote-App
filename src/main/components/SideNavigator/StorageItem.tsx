import React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import Storage from '../../stores/Storage'
import FolderItem from './FolderItem'
import FolderCreateForm from './FolderCreateForm'
import NavLink from './NavLink'
import { StyledStorageItem, StyledStorageItemHeader } from './styled'

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
    const { name, storage, pathname, active } = this.props
    const folderEntries = [...storage.folderMap.entries()]

    return (
      <StyledStorageItem>
        <StyledStorageItemHeader>
          <NavLink active={active} to={`/storages/${name}`}>
            {name}
          </NavLink>
          <button onClick={this.removeStorage}>x</button>
        </StyledStorageItemHeader>
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
      </StyledStorageItem>
    )
  }
}

export default StorageItem
