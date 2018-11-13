import * as React from 'react'
import { inject, observer } from 'mobx-react'
import DataStore from './stores/DataStore'

type SideNavigatorProps = {
  data?: DataStore
}

@inject('data')
@observer
export default class SideNavigator extends React.Component<SideNavigatorProps> {
  render () {
    const storageEntries = [...this.props.data.storageMap.entries()]
    return <nav>SideNav
      <ul>
        {storageEntries.map(([name]) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      {storageEntries.length === 0 &&
        <p>No storages</p>
      }
    </nav>
  }
}
