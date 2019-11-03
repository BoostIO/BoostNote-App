import React, { useEffect, useMemo } from 'react'
import SideNavigator from './SideNavigator'
import Router from './Router'
import GlobalStyle from './GlobalStyle'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '../lib/styled/themes'
import { StyledAppContainer } from './styled'
import ContextMenu from './ContextMenu'
import Dialog from './Dialog/Dialog'
import { useDb } from '../lib/db'
import TwoPaneLayout from './atoms/TwoPaneLayout'
import PreferencesModal from './PreferencesModal/PreferencesModal'
import { useGlobalKeyDownHandler, isWithGeneralCtrlKey } from '../lib/keyboard'
import { usePreferences } from '../lib/preferences'

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

  return (
    <ThemeProvider theme={defaultTheme}>
      <StyledAppContainer>
        {initialized ? (
          <TwoPaneLayout
            defaultLeftWidth={160}
            left={<SideNavigator />}
            right={<Router />}
          />
        ) : (
          <div>Loading data</div>
        )}
        <GlobalStyle />
        <ContextMenu />
        <Dialog />
        <PreferencesModal />
      </StyledAppContainer>
    </ThemeProvider>
  )
}

export default App
