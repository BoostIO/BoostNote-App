import React, { useMemo, useCallback, useEffect } from 'react'
import SideNavigator from './SideNavigator'
import Router from './Router'
import GlobalStyle from './GlobalStyle'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '../lib/styled/themes/default'
import { darkTheme } from '../lib/styled/themes/dark'
import { lightTheme } from '../lib/styled/themes/light'
import { sepiaTheme } from '../lib/styled/themes/sepia'
import { solarizedDarkTheme } from '../lib/styled/themes/solarizedDark'
import { StyledAppContainer } from './styled'
import ContextMenu from './ContextMenu'
import Dialog from './Dialog/Dialog'
import { useDb } from '../lib/db'
import TwoPaneLayout from './atoms/TwoPaneLayout'
import PreferencesModal from './PreferencesModal/PreferencesModal'
import { useGlobalKeyDownHandler, isWithGeneralCtrlKey } from '../lib/keyboard'
import { usePreferences } from '../lib/preferences'
import '../lib/i18n'
import '../lib/analytics'
import CodeMirrorStyle from './CodeMirrorStyle'
import { useGeneralStatus } from '../lib/generalStatus'
import Modal from './Modal'
import ToastList from './Toast'
import { useToast } from '../lib/toast'
import { useUsers } from '../lib/accounts'
import styled from '../lib/styled'

export const LoadingText = styled.div`
  margin: 30px;
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

  const { toggleClosed, preferences } = usePreferences()
  const keyboardHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      switch (event.key) {
        case ',':
          if (isWithGeneralCtrlKey(event)) {
            toggleClosed()
          }
      }
    }
  }, [toggleClosed])
  useGlobalKeyDownHandler(keyboardHandler)
  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const updateSideBarWidth = useCallback(
    (leftWidth: number) => {
      setGeneralStatus({
        sideBarWidth: leftWidth
      })
    },
    [setGeneralStatus]
  )
  return (
    <ThemeProvider theme={selectTheme(preferences['general.theme'])}>
      <StyledAppContainer
        onDrop={(event: React.DragEvent) => {
          event.preventDefault()
        }}
      >
        {initialized ? (
          <TwoPaneLayout
            defaultLeftWidth={generalStatus.sideBarWidth}
            left={<SideNavigator />}
            right={<Router />}
            onResizeEnd={updateSideBarWidth}
          />
        ) : (
          <LoadingText>Loading Data...</LoadingText>
        )}
        <GlobalStyle />
        <ContextMenu />
        <Dialog />
        <PreferencesModal />
        <Modal />
        <ToastList />
        <CodeMirrorStyle />
      </StyledAppContainer>
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
