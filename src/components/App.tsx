import React, { useMemo, useState, useCallback, useEffect } from 'react'
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
import {
  defaultStorageCreatedKey,
  appModeChosenKey,
} from '../lib/localStorageKeys'
import {
  getPathByName,
  addIpcListener,
  removeIpcListener,
} from '../lib/electronOnly'
import { generateId } from '../lib/string'
import FSNoteDb from '../lib/db/FSNoteDb'
import path from 'path'
import { useGeneralStatus } from '../lib/generalStatus'
import { getFolderItemId } from '../lib/nav'
import AppModeModal from './organisms/AppModeModal'
import { useBoostNoteProtocol } from '../lib/protocol'
import { fetchDesktopGlobalData } from '../lib/boosthub'
import { useDialog, DialogIconTypes } from '../lib/dialog'
import {
  listenBoostHubTeamCreateEvent,
  unlistenBoostHubTeamCreateEvent,
  BoostHubTeamCreateEvent,
} from '../lib/events'

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

const defaultNoteContent = `BoostNote.next is a renewal of the [Boostnote app](https://github.com/BoostIO/Boostnote).
Thanks for downloading our app!

# [Boost Note for Teams](https://boosthub.io/)

We've developed a collaborative workspace app called "Boost Hub" for developer teams.

It's customizable and easy to optimize for your team like rego blocks and even lets you edit documents together in real-time!

# Community

Please check out.

- [GitHub](https://github.com/BoostIO/BoostNote.next)
- [Facebook Group](https://www.facebook.com/groups/boostnote/)
- [Twitter](https://twitter.com/boostnoteapp)
- [Slack Group](https://join.slack.com/t/boostnote-group/shared_invite/zt-cun7pas3-WwkaezxHBB1lCbUHrwQLXw)
- [Blog](https://medium.com/boostnote)
- [Reddit](https://www.reddit.com/r/Boostnote/)
`

const App = () => {
  const { initialize, queueSyncingAllStorage, createStorage } = useDb()
  const { replace, push } = useRouter()
  const [initialized, setInitialized] = useState(false)
  const { addSideNavOpenedItem, setGeneralStatus } = useGeneralStatus()
  const {
    togglePreferencesModal,
    preferences,
    setPreferences,
  } = usePreferences()
  const { messageBox } = useDialog()

  useEffectOnce(() => {
    const boostHubUserInfo = preferences['boosthub.user']
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
                title: 'Welcome to BoostNote.next!',
                content: defaultNoteContent,
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
      .then(() => {
        const appModeChosen = localLiteStorage.getItem(appModeChosenKey)
        if (appModeChosen !== 'true') {
          setShowAppModeModal(true)
        }
        localLiteStorage.setItem(appModeChosenKey, 'true')
      })
      .then(async () => {
        if (boostHubUserInfo == null) {
          return
        }
        const { user, teams } = await fetchDesktopGlobalData()
        if (user == null) {
          setPreferences({
            'boosthub.user': undefined,
          })
          setGeneralStatus({
            boostHubTeams: [],
          })
          return
          // User's auth is invalidated. Should go to auth page
          messageBox({
            title: 'Boost Hub login is required',
            message: 'Your BoostHub session has been expired.',
            buttons: ['Sign In Again', 'Cancel'],
            defaultButtonIndex: 0,
            iconType: DialogIconTypes.Warning,
            onClose: (value: number | null) => {
              if (value === 0) {
                return
              }

              setPreferences({
                'boosthub.user': undefined,
              })
              setGeneralStatus({
                boostHubTeams: [],
              })
            },
          })
          return
        }
        setPreferences((previousPreferences) => {
          return {
            ...previousPreferences,
            'boosthub.user': {
              id: user.id,
              uniqueName: user.uniqueName,
              displayName: user.displayName,
            },
          }
        })
        setGeneralStatus({
          boostHubTeams: teams.map((team) => {
            return {
              id: team.id,
              name: team.name,
              domain: team.domain,
            }
          }),
        })
      })
  })

  useEffect(() => {
    addIpcListener('preferences', togglePreferencesModal)
    return () => {
      removeIpcListener('preferences', togglePreferencesModal)
    }
  }, [togglePreferencesModal])

  useEffect(() => {
    const boosthubTeamCreateEventHandler = (event: BoostHubTeamCreateEvent) => {
      const team = event.detail.team
      setGeneralStatus((previousGeneralStatus) => {
        return {
          boostHubTeams: [...previousGeneralStatus.boostHubTeams!, team],
        }
      })
      push(`/app/boosthub/teams/${team.domain}`)
    }
    listenBoostHubTeamCreateEvent(boosthubTeamCreateEventHandler)
    return () => {
      unlistenBoostHubTeamCreateEvent(boosthubTeamCreateEventHandler)
    }
  }, [push, setGeneralStatus])

  useBoostNoteProtocol()

  const keyboardHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      switch (event.key) {
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
  }, [])
  useGlobalKeyDownHandler(keyboardHandler)

  const [showAppModeModal, setShowAppModeModal] = useState(false)

  const closeAppModeModal = useCallback(() => {
    setShowAppModeModal(false)
  }, [])

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
        {showAppModeModal && <AppModeModal closeModal={closeAppModeModal} />}
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
