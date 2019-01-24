import React from 'react'
import { inject, observer } from 'mobx-react'
import DataStore from '../../stores/DataStore'
import StorageItem from './StorageItem/StorageItem'
import RouteStore from '../../stores/RouteStore'
import SotrageCreateForm from './StorageCreateForm'
import { StyledSideNavContainer, StyledStorageList } from './styled'

type SideNavigatorProps = {
  data?: DataStore
  route?: RouteStore
}

@inject('data', 'route')
@observer
export default class SideNavigator extends React.Component<SideNavigatorProps> {
  createStorage = async (storageName: string) => {
    const { data } = this.props
    await data!.createStorage(storageName)
  }

  removeStorage = async (storageName: string) => {
    const { data } = this.props
    await data!.removeStorage(storageName)
  }

  createFolder = async (storageName: string, folderPath: string) => {
    const { data } = this.props
    await data!.createFolder(storageName, folderPath)
  }

  removeFolder = async (storageName: string, folderPath: string) => {
    const { data } = this.props
    await data!.removeFolder(storageName, folderPath)
  }

  render() {
    const { data, route } = this.props
    const storageEntries = [...data!.storageMap.entries()]

    return (
      <StyledSideNavContainer style={{ width: 160 }}>
        <StyledStorageList>
          {storageEntries.map(([name, storage]) => {
            const pathname = route!.pathname
            const active = `/storages/${name}` === pathname
            return (
              <StorageItem
                key={name}
                name={name}
                storage={storage}
                removeStorage={this.removeStorage}
                createFolder={this.createFolder}
                removeFolder={this.removeFolder}
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
