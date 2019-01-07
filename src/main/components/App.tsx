import React from 'react'
import { inject, observer } from 'mobx-react'
import styled from './styled'
import SideNavigator from './SideNavigator'
import NotePage from './NotePage'
import AppStore from '../stores/AppStore'
import GlobalStyle from './GlobalStyle'
import { ThemeProvider } from 'emotion-theming'
import { defaultTheme } from '../themes/default'

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
      <ThemeProvider theme={defaultTheme}>
        <Root>
          {app.dataIsInitialized ? (
            <>
              <SideNavigator />
              <NotePage />
            </>
          ) : (
            <div>Loading data</div>
          )}
          <GlobalStyle />
        </Root>
      </ThemeProvider>
    )
  }
}

export default App
