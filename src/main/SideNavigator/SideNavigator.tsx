import React from 'react'
import { inject, observer } from 'mobx-react'
import DataStore from '../stores/DataStore'

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

    const dataStore = this.props.data as DataStore

    await dataStore.createStorage(newStorageName)
    this.setState({
      newStorageName: ''
    })
  }

  render() {
    const storageEntries = [...this.props.data!.storageMap.entries()]
    return (
      <nav>
        <div>SideNav</div>
        <ul>
          {storageEntries.map(([name]) => (
            <li key={name}>{name}</li>
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
