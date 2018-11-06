import * as React from 'react'
import { inject } from 'mobx-react'
import DataStore from './stores/DataStore'

type SideNavigatorProps = {
  data?: DataStore
}

@inject('data')
export default class SideNavigator extends React.Component<SideNavigatorProps> {
  render () {
    const storageEntries = [...this.props.data.storageMap.entries()]
    return <div>SideNav
      <ul>
        {storageEntries.map(([name]) => (
          <li>{name}</li>
        ))}
      </ul>
      {storageEntries.length === 0 &&
        <p>No storages</p>
      }
    </div>
  }
}
