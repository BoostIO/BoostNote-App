import React from 'react'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import SideNavigator from './SideNavigator'
import NotePage from './NotePage'
import AppStore from '../stores/AppStore'

const Root = styled.div`
  display: flex;
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
            <SideNavigator />
            <NotePage />
          </>
        ) : (
          <div>Loading data</div>
        )}
      </Root>
    )
  }
}

export default App
