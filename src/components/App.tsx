import React, { useMemo, useState } from 'react'
import Router from './Router'
import GlobalStyle from './GlobalStyle'
import { ThemeProvider } from 'styled-components'
import { legacyTheme } from '../themes/legacy'
import { darkTheme } from '../themes/dark'
import { lightTheme } from '../themes/light'
import { sepiaTheme } from '../themes/sepia'
import { solarizedDarkTheme } from '../themes/solarizedDark'
import Dialog from './organisms/Dialog'
import { useDb } from '../lib/db'
import PreferencesModal from './PreferencesModal/PreferencesModal'
import { useGlobalKeyDownHandler, isWithGeneralCtrlKey } from '../lib/keyboard'
import { usePreferences } from '../lib/preferences'
import '../lib/i18n'
import '../lib/analytics'
import CodeMirrorStyle from './CodeMirrorStyle'
import ToastList from './Toast'
import styled from '../lib/styled'
import { useEffectOnce } from 'react-use'
import AppNavigator from './organisms/AppNavigator'
import { useRouter } from '../lib/router'
import { values } from '../lib/db/utils'
import { localLiteStorage } from 'ltstrg'
import { defaultStorageCreatedKey } from '../lib/localStorageKeys'
import { getPathByName } from '../lib/electronOnly'
import { generateId } from '../lib/string'
import FSNoteDb from '../lib/db/FSNoteDb'
import path from 'path'
import { useGeneralStatus } from '../lib/generalStatus'
import { getFolderItemId } from '../lib/nav'

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
  const { initialize, queueSyncingAllStorage, createStorage } = useDb()
  const { replace } = useRouter()
  const [initialized, setInitialized] = useState(false)
  const { addSideNavOpenedItem } = useGeneralStatus()

  useEffectOnce(() => {
    initialize()
      .then(async (storageMap) => {
        const storages = values(storageMap)
        if (storages.length > 0) {
          queueSyncingAllStorage(0)
        }

        const defaultStorageCreated = localLiteStorage.getItem(
          defaultStorageCreatedKey
        )
        if (defaultStorageCreated !== 'true') {
          if (values(storageMap).length === 0) {
            try {
              const defaultStoragePath = path.join(
                getPathByName('userData'),
                'default-storage'
              )
              const db = new FSNoteDb(
                generateId(),
                'My Notes',
                defaultStoragePath
              )
              await db.init()

              const note = await db.createNote({
                title: 'Welcome!',
                // TODO: Initial notes
                content: '',
              })

              const storage = await createStorage('My Notes', {
                type: 'fs',
                location: defaultStoragePath,
              })
              addSideNavOpenedItem(getFolderItemId(storage.id, '/'))
              replace(`/app/storages/${storage.id}/notes/${note._id}`)
            } catch (error) {
              console.warn('Failed to create default storage')
              console.warn(error)
            }
          }
          localLiteStorage.setItem(defaultStorageCreatedKey, 'true')
        }
        setInitialized(true)
      })
      .catch((error) => {
        console.error(error)
      })
  })

  const { togglePreferencesModal, preferences } = usePreferences()
  const keyboardHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      switch (event.key) {
        case ',':
          if (isWithGeneralCtrlKey(event)) {
            togglePreferencesModal()
          }
          break
        case 'a':
          if (isWithGeneralCtrlKey(event) && event.target != null) {
            const targetElement = event.target as HTMLElement
            const windowSelection = window.getSelection()
            if (
              targetElement.classList.contains('MarkdownPreviewer') &&
              windowSelection != null
            ) {
              event.preventDefault()
              const range = document.createRange()
              range.selectNode(targetElement)
              windowSelection.addRange(range)
            }
          }
          break
      }
    }
  }, [togglePreferencesModal])
  useGlobalKeyDownHandler(keyboardHandler)

  return (
    <ThemeProvider theme={selectTheme(preferences['general.theme'])}>
      <AppContainer
        onDrop={(event: React.DragEvent) => {
          event.preventDefault()
        }}
      >
        {initialized ? (
          <>
            {preferences['general.showAppNavigator'] && <AppNavigator />}
            <Router />
          </>
        ) : (
          <LoadingText>Loading Data...</LoadingText>
        )}
        <GlobalStyle />
        <Dialog />
        <PreferencesModal />
        <ToastList />
        <CodeMirrorStyle />
      </AppContainer>
    </ThemeProvider>
  )
}
function selectTheme(theme: string) {
  switch (theme) {
    case 'legacy':
      return legacyTheme
    case 'light':
      return lightTheme
    case 'sepia':
      return sepiaTheme
    case 'solarizedDark':
      return solarizedDarkTheme
    case 'dark':
    default:
      return darkTheme
  }
}

export default App
