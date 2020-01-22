import React, { useEffect } from 'react'
import SideNavigator from '../../components/SideNavigator'
import GlobalStyle from '../../components/GlobalStyle'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '../../themes/default'
import { darkTheme } from '../../themes/dark'
import { lightTheme } from '../../themes/light'
import { sepiaTheme } from '../../themes/sepia'
import { solarizedDarkTheme } from '../../themes/solarizedDark'
import ContextMenu from '../../components/ContextMenu'
import Dialog from '../../components/Dialog/Dialog'
import { useDb } from '../../lib/db'
import PreferencesModal from '../../components/PreferencesModal/PreferencesModal'
import { usePreferences } from '../../lib/preferences'
import '../lib/i18n'
import '../lib/analytics'
import CodeMirrorStyle from '../../components/CodeMirrorStyle'
import { useToast } from '../../lib/toast'
import { useUsers } from '../../lib/accounts'
import styled from '../../lib/styled'

const LoadingText = styled.div`
  margin: 30px;
`

const AppContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
`

const App = () => {
  const { initialize, initialized } = useDb()
  const [users, { removeUser }] = useUsers()
  const { pushMessage } = useToast()
  useEffect(() => {
    initialize(users[0]).catch(error => {
      if (error.message === 'InvalidUser') {
        if (users[0] != null) {
          removeUser(users[0])
        }
        pushMessage({
          title: 'Authentication Error',
          description: 'Please try logging in again'
        })
      } else {
        pushMessage({
          title: 'Network Error',
          description: 'An server error occured'
        })
        console.error(error)
      }
    })
  }, [users])

  const { preferences } = usePreferences()

  return (
    <ThemeProvider theme={selectTheme(preferences['general.theme'])}>
      <AppContainer
        onDrop={(event: React.DragEvent) => {
          event.preventDefault()
        }}
      >
        {initialized ? (
          <>
            <SideNavigator />
            <div>Page</div>
          </>
        ) : (
          <LoadingText>Loading Data...</LoadingText>
        )}
        <GlobalStyle />
        <ContextMenu />
        <Dialog />
        <PreferencesModal />
        <CodeMirrorStyle />
      </AppContainer>
    </ThemeProvider>
  )
}
function selectTheme(theme: string) {
  switch (theme) {
    case 'dark':
      return darkTheme
    case 'light':
      return lightTheme
    case 'sepia':
      return sepiaTheme
    case 'solarizedDark':
      return solarizedDarkTheme
    default:
      return defaultTheme
  }
}

export default App
