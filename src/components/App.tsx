import React from 'react'
import { inject, observer } from 'mobx-react'
import SideNavigator from './SideNavigator'
import Router from './Router'
import AppStore from '../lib/AppStore'
import GlobalStyle from './GlobalStyle'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '../lib/styled/themes/default'
import { StyledAppContainer } from './styled'
import ContextMenu from './ContextMenu'
import Dialog from './Dialog/Dialog'

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
      <ThemeProvider theme={defaultTheme}>
        <StyledAppContainer>
          {app.dataIsInitialized ? (
            <>
              <SideNavigator />
              <Router />
            </>
          ) : (
            <div>Loading data</div>
          )}
          <GlobalStyle />
          <ContextMenu />
          <Dialog />
        </StyledAppContainer>
      </ThemeProvider>
    )
  }
}

export default App
