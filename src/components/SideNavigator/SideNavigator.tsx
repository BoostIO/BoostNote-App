import React from 'react'
import { inject, observer } from 'mobx-react'
import StorageItem from './StorageItem/StorageItem'
import { RouteStore } from '../../lib/RouteStore'
import SotrageCreateForm from './StorageCreateForm'
import { StyledSideNavContainer, StyledStorageList } from './styled'
import { useDb, DbContext } from '../../lib/db'

type SideNavigatorProps = {
  db: DbContext
  route?: RouteStore
}

@inject('route')
@observer
class SideNavigator extends React.Component<SideNavigatorProps> {
  createStorage = async (storageName: string) => {
    const { db } = this.props
    await db.createStorage(storageName)
  }

  removeStorage = async (storageId: string) => {
    const { db } = this.props
    await db!.removeStorage(storageId)
  }

  // createFolder = async (storageId: string, folderPath: string) => {
  //   const { data } = this.props
  //   await data!.createFolder(storageId, folderPath)
  // }

  // removeFolder = async (storageId: string, folderPath: string) => {
  //   const { data } = this.props
  //   await data!.removeFolder(storageId, folderPath)
  // }

  render() {
    const { db, route } = this.props
    const storageEntries = Object.entries(db.storageMap)

    return (
      <StyledSideNavContainer style={{ width: 160 }}>
        <StyledStorageList>
          {storageEntries.map(([id, storage]) => {
            const pathname = route!.pathname
            const active = `/storages/${storage.name}` === pathname
            return (
              <StorageItem
                key={id}
                id={id}
                storage={storage}
                removeStorage={this.removeStorage}
                // createFolder={this.createFolder}
                // removeFolder={this.removeFolder}
                createFolder={async () => {}}
                removeFolder={async () => {}}
                pathname={pathname}
                active={active}
              />
            )
          })}
        </StyledStorageList>
        {storageEntries.length === 0 && <p>No storages</p>}
        <SotrageCreateForm createStorage={this.createStorage} />
      </StyledSideNavContainer>
    )
  }
}

export default () => {
  const db = useDb()
  return <SideNavigator db={db} />
}
