import React, { useMemo, useState, useEffect } from 'react'
import Router from './Router'
import GlobalStyle from './GlobalStyle'
import { ThemeProvider } from 'styled-components'
import { selectTheme } from '../themes'
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
import { useBoostNoteProtocol } from '../lib/protocol'
import { useBoostHub, getBoostHubTeamIconUrl } from '../lib/boosthub'
import { useDialog, DialogIconTypes } from '../lib/dialog'
import {
  listenBoostHubTeamCreateEvent,
  unlistenBoostHubTeamCreateEvent,
  BoostHubTeamCreateEvent,
  BoostHubTeamUpdateEvent,
  listenBoostHubTeamUpdateEvent,
  unlistenBoostHubTeamUpdateEvent,
  BoostHubTeamDeleteEvent,
  listenBoostHubTeamDeleteEvent,
  unlistenBoostHubTeamDeleteEvent,
  dispatchBoostHubLoginRequestEvent,
  listenBoostHubAccountDeleteEvent,
  unlistenBoostHubAccountDeleteEvent,
  dispatchBoostHubToggleSettingsEvent,
} from '../lib/events'
import {
  useCheckedFeatures,
  featureBoostHubIntro,
} from '../lib/checkedFeatures'
import BoostHubIntroModal from '../components/organisms/BoostHubIntroModal'
import { useRouteParams } from '../lib/routeParams'
import { useCreateWorkspaceModal } from '../lib/createWorkspaceModal'
import CreateWorkspaceModal from './organisms/CreateWorkspaceModal'

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
  const { fetchDesktopGlobalData } = useBoostHub()
  const routeParams = useRouteParams()

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
  })

  useEffectOnce(() => {
    const run = async () => {
      const boostHubUserInfo = preferences['boosthub.user']
      if (boostHubUserInfo == null) {
        return
      }
      const { user, teams } = await fetchDesktopGlobalData()
      if (user == null) {
        messageBox({
          title: 'Boost Hub login is required',
          message: 'Your BoostHub session has been expired.',
          buttons: ['Sign In Again', 'Cancel'],
          defaultButtonIndex: 0,
          iconType: DialogIconTypes.Warning,
          onClose: (value: number | null) => {
            if (value === 0) {
              push(`/app/boosthub/login`)
              setTimeout(() => {
                dispatchBoostHubLoginRequestEvent()
              }, 1000)
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
            iconUrl: team.iconUrl,
          }
        }),
      })
    }
    run()
  })

  const boostHubTeamsShowPageIsActive =
    routeParams.name === 'boosthub.teams.show'

  useEffect(() => {
    const handler = () => {
      if (boostHubTeamsShowPageIsActive) {
        dispatchBoostHubToggleSettingsEvent()
      } else {
        togglePreferencesModal()
      }
    }
    addIpcListener('preferences', handler)
    return () => {
      removeIpcListener('preferences', handler)
    }
  }, [togglePreferencesModal, boostHubTeamsShowPageIsActive])

  useEffect(() => {
    const boostHubTeamCreateEventHandler = (event: BoostHubTeamCreateEvent) => {
      const createdTeam = event.detail.team
      setGeneralStatus((previousGeneralStatus) => {
        const teamMap =
          previousGeneralStatus.boostHubTeams!.reduce((map, team) => {
            map.set(team.id, team)
            return map
          }, new Map()) || new Map()
        teamMap.set(createdTeam.id, {
          id: createdTeam.id,
          name: createdTeam.name,
          domain: createdTeam.domain,
          iconUrl:
            createdTeam.icon != null
              ? getBoostHubTeamIconUrl(createdTeam.icon.location)
              : undefined,
        })
        return {
          boostHubTeams: [...teamMap.values()],
        }
      })
      push(`/app/boosthub/teams/${createdTeam.domain}`)
    }

    const boostHubTeamUpdateEventHandler = (event: BoostHubTeamUpdateEvent) => {
      const updatedTeam = event.detail.team
      setGeneralStatus((previousGeneralStatus) => {
        const teamMap =
          previousGeneralStatus.boostHubTeams!.reduce((map, team) => {
            map.set(team.id, team)
            return map
          }, new Map()) || new Map()
        teamMap.set(updatedTeam.id, {
          id: updatedTeam.id,
          name: updatedTeam.name,
          domain: updatedTeam.domain,
          iconUrl:
            updatedTeam.icon != null
              ? getBoostHubTeamIconUrl(updatedTeam.icon.location)
              : undefined,
        })
        return {
          boostHubTeams: [...teamMap.values()],
        }
      })
    }

    const boostHubTeamDeleteEventHandler = (event: BoostHubTeamDeleteEvent) => {
      push(`/app`)
      const deletedTeam = event.detail.team
      setGeneralStatus((previousGeneralStatus) => {
        const teamMap =
          previousGeneralStatus.boostHubTeams!.reduce((map, team) => {
            map.set(team.id, team)
            return map
          }, new Map()) || new Map()
        teamMap.delete(deletedTeam.id)
        return {
          boostHubTeams: [...teamMap.values()],
        }
      })
    }

    const boostHubAccountDeleteEventHandler = () => {
      push(`/app`)
      setPreferences({
        'boosthub.user': undefined,
      })
      setGeneralStatus({
        boostHubTeams: [],
      })
    }

    listenBoostHubTeamCreateEvent(boostHubTeamCreateEventHandler)
    listenBoostHubTeamUpdateEvent(boostHubTeamUpdateEventHandler)
    listenBoostHubTeamDeleteEvent(boostHubTeamDeleteEventHandler)
    listenBoostHubAccountDeleteEvent(boostHubAccountDeleteEventHandler)
    return () => {
      unlistenBoostHubTeamCreateEvent(boostHubTeamCreateEventHandler)
      unlistenBoostHubTeamUpdateEvent(boostHubTeamUpdateEventHandler)
      unlistenBoostHubTeamDeleteEvent(boostHubTeamDeleteEventHandler)
      unlistenBoostHubAccountDeleteEvent(boostHubAccountDeleteEventHandler)
    }
  }, [push, setPreferences, setGeneralStatus])

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

  const { isChecked } = useCheckedFeatures()

  const {
    showCreateWorkspaceModal,
    toggleShowCreateWorkspaceModal,
  } = useCreateWorkspaceModal()

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
            {!isChecked(featureBoostHubIntro) && <BoostHubIntroModal />}
            {showCreateWorkspaceModal && (
              <CreateWorkspaceModal
                closeModal={toggleShowCreateWorkspaceModal}
              />
            )}
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

export default App
