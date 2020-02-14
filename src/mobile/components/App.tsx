import React, { useEffect } from 'react'
import Navigator from './Navigator'
import GlobalStyle from '../../components/GlobalStyle'
import { ThemeProvider } from 'styled-components'
import { darkTheme } from '../../themes/dark'
import ContextMenu from './organisms/ContextMenu'
import Dialog from '../../components/organisms/Dialog'
import { useDb } from '../lib/db'
import PreferencesModal from './organisms/PreferencesModal'
import CodeMirrorStyle from './atoms/CodeMirrorStyle'
import { useToast } from '../../lib/toast'
import { useUsers } from '../../lib/accounts'
import styled from '../../lib/styled'
import Router from './Router'
import { useGeneralStatus } from '../lib/generalStatus'

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
  color: #fff;
`

const NavContainer = styled.div`
  position: absolute;
  z-index: 1002;
  max-width: 300px;
  top: 0;
  left: -100%;
  height: 100%;
  width: 100%;
  transition: left 150ms ease-in-out;
  &.active {
    left: 0;
  }
`

const NavRoot = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 150ms ease-in-out;
  &.active {
    pointer-events: initial;
    opacity: 1;
  }
`

const NavShadow = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 1001;
  background-color: rgba(0, 0, 0, 0.3);
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

  const { generalStatus, toggleNav } = useGeneralStatus()

  return (
    <ThemeProvider theme={darkTheme}>
      <AppContainer>
        {initialized ? (
          <>
            <NavRoot className={generalStatus.navIsOpen ? 'active' : ''}>
              <NavContainer className={generalStatus.navIsOpen ? 'active' : ''}>
                <Navigator toggle={toggleNav} />
              </NavContainer>
              <NavShadow onClick={toggleNav} />
            </NavRoot>
            <Router />
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

export default App
