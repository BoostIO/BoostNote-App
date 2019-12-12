import React, { useEffect, useMemo, useCallback } from 'react'
import SideNavigator from './SideNavigator'
import Router from './Router'
import GlobalStyle from './GlobalStyle'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '../lib/styled/themes/default'
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
  const { toggleClosed } = usePreferences()

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
    <ThemeProvider theme={defaultTheme}>
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

export default App
