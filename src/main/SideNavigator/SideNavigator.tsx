import React from 'react'
import { inject, observer } from 'mobx-react'
import DataStore from '../stores/DataStore'
import StorageItem from './StorageItem'

type SideNavigatorProps = {
  data?: DataStore
}

@inject('data')
@observer
export default class SideNavigator extends React.Component<SideNavigatorProps> {
  state = {
    newStorageName: ''
  }
  newStorageNameInputRef = React.createRef<HTMLInputElement>()

  updateStorageName = () => {
    this.setState({
      newStorageName: this.newStorageNameInputRef.current!.value
    })
  }

  addStorage = async () => {
    const { newStorageName } = this.state
    const { data } = this.props

    await data!.createStorage(newStorageName)
    this.setState({
      newStorageName: ''
    })
  }

  removeStorage = async (storageName: string) => {
    const { data } = this.props
    await data!.removeStorage(storageName)
  }

  render() {
    const { data } = this.props
    const storageEntries = [...data!.storageMap.entries()]
    return (
      <nav>
        <div>SideNav</div>
        <ul>
          {storageEntries.map(([name, storage]) => (
            <StorageItem
              key={name}
              name={name}
              storage={storage}
              removeStorage={this.removeStorage}
            />
          ))}
        </ul>
        {storageEntries.length === 0 && <p>No storages</p>}
        <div>
          <label>New storage</label>
          <input
            type="text"
            ref={this.newStorageNameInputRef}
            value={this.state.newStorageName}
            onChange={this.updateStorageName}
          />
          <button type="submit" onClick={this.addStorage}>
            Add
          </button>
        </div>
      </nav>
    )
  }
}
