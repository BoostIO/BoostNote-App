import React, { useEffect, useMemo, useCallback } from 'react'
import SideNavigator from './SideNavigator'
import Router from './Router'
import GlobalStyle from './GlobalStyle'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '../lib/styled/themes/default'
import { darkTheme } from '../lib/styled/themes/dark'
import { lightTheme } from '../lib/styled/themes/light'
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

const App = () => {
  const { initialize, initialized } = useDb()
  useEffect(() => {
    initialize()
  }, [initialize])
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
          <div>Loading data</div>
        )}
        <GlobalStyle />
        <ContextMenu />
        <Dialog />
        <PreferencesModal />
        <Modal />
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
    default:
      return defaultTheme
  }
}
export default App
