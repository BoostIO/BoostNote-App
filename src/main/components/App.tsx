import React from 'react'
import { inject, observer } from 'mobx-react'
import SideNavigator from './SideNavigator'
import NotePage from './NotePage'
import AppStore from '../stores/AppStore'
import GlobalStyle from './GlobalStyle'
import { ThemeProvider } from 'emotion-theming'
import { defaultTheme } from '../themes/default'
import { StyledAppContainer } from './styled'
import ContextMenu from './ContextMenu'

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
              <NotePage />
            </>
          ) : (
            <div>Loading data</div>
          )}
          <GlobalStyle />
          <ContextMenu />
        </StyledAppContainer>
      </ThemeProvider>
    )
  }
}

export default App
