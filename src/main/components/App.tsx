import React from 'react'
import styled from 'styled-components'
import SideNavigator from './SideNavigator'
import NoteList from './NoteList'
import { inject, observer } from 'mobx-react'
import AppStore from '../stores/AppStore'

const Root = styled.div`
  display: flex;
  .nav {
  }
  .list {
  }
  .detail {
    flex: 1;
  }
`

type AppProps = {
  app?: AppStore
}

@inject('app')
@observer
class App extends React.Component<AppProps> {
  componentDidMount() {
    const app = this.props.app!
    if (!app.dataIsInitialized) {
      app.initializeData()
    }
  }

  render() {
    const app = this.props.app!
    return (
      <Root>
        {app.dataIsInitialized ? (
          <>
            <div className="nav">
              <SideNavigator />
            </div>
            <div className="panel">
              <NoteList />
            </div>
            <div className="panel">Note Detail</div>
          </>
        ) : (
          <div>Loading data</div>
        )}
      </Root>
    )
  }
}

export default App
