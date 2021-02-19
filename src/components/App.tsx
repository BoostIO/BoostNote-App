import React, { useState, useEffect, useCallback } from 'react'
import Router from './Router'
import GlobalStyle from './GlobalStyle'
import { ThemeProvider } from 'styled-components'
import { selectTheme } from '../themes'
import Dialog from './organisms/Dialog'
import { useDb } from '../lib/db'
import PreferencesModal from './PreferencesModal/PreferencesModal'
import { usePreferences } from '../lib/preferences'
import '../lib/i18n'
import '../lib/analytics'
import CodeMirrorStyle from './CodeMirrorStyle'
import ToastList from './Toast'
import styled from '../lib/styled'
import { useEffectOnce } from 'react-use'
import AppNavigator from './organisms/AppNavigator'
import { useRouter } from '../lib/router'
import { values, keys } from '../lib/db/utils'
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
import {
  useBoostHub,
  getBoostHubTeamIconUrl,
  getLegacySessionCookie,
  getDesktopAccessTokenFromSessionKey,
  flushLegacySessionCookie,
} from '../lib/boosthub'
import {
  boostHubTeamCreateEventEmitter,
  BoostHubTeamCreateEvent,
  BoostHubTeamUpdateEvent,
  boostHubTeamUpdateEventEmitter,
  BoostHubTeamDeleteEvent,
  boostHubTeamDeleteEventEmitter,
  boostHubAccountDeleteEventEmitter,
  boostHubToggleSettingsEventEmitter,
  boostHubLoginRequestEventEmitter,
} from '../lib/events'
import {
  useCheckedFeatures,
  featureBoostHubIntro,
} from '../lib/checkedFeatures'
import BoostHubIntroModal from '../components/organisms/BoostHubIntroModal'
import { useRouteParams } from '../lib/routeParams'
import { useCreateWorkspaceModal } from '../lib/createWorkspaceModal'
import CreateWorkspaceModal from './organisms/CreateWorkspaceModal'
import { useStorageRouter } from '../lib/storageRouter'
import ExternalStyle from './ExternalStyle'
import { useDialog, DialogIconTypes } from '../lib/dialog'

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
  const {
    initialize,
    queueSyncingAllStorage,
    createStorage,
    storageMap,
  } = useDb()
  const { replace, push } = useRouter()
  const [initialized, setInitialized] = useState(false)
  const {
    addSideNavOpenedItem,
    setGeneralStatus,
    generalStatus,
  } = useGeneralStatus()
  const {
    togglePreferencesModal,
    preferences,
    setPreferences,
  } = usePreferences()
  const { fetchDesktopGlobalData } = useBoostHub()
  const routeParams = useRouteParams()
  const { navigate: navigateToStorage } = useStorageRouter()
  const { messageBox } = useDialog()

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
      const cloudUserInfo = preferences['cloud.user']
      let accessToken: string
      if (cloudUserInfo == null) {
        const legacyCookie = await getLegacySessionCookie()
        if (legacyCookie == null) {
          return
        }

        console.info('Get a new access token from legacy session...')
        const { token } = await getDesktopAccessTokenFromSessionKey(
          legacyCookie.value
        )
        accessToken = token

        await flushLegacySessionCookie()
      } else {
        accessToken = cloudUserInfo.accessToken
      }

      const desktopGlobalData = await fetchDesktopGlobalData(accessToken)
      if (desktopGlobalData.user == null) {
        messageBox({
          title: 'Sign In',
          message: 'Your cloud access token has been expired.',
          buttons: ['Sign In Again', 'Cancel'],
          defaultButtonIndex: 0,
          iconType: DialogIconTypes.Warning,
          onClose: (value: number | null) => {
            if (value === 0) {
              push(`/app/boosthub/login`)
              setTimeout(() => {
                boostHubLoginRequestEventEmitter.dispatch()
              }, 1000)
              return
            }

            setPreferences({
              'cloud.user': undefined,
            })
            setGeneralStatus({
              boostHubTeams: [],
            })
          },
        })
        return
      }
      const user = desktopGlobalData.user
      setPreferences({
        'cloud.user': {
          id: user.id,
          uniqueName: user.uniqueName,
          displayName: user.displayName,
          accessToken,
        },
      })
      setGeneralStatus({
        boostHubTeams: desktopGlobalData.teams.map((team) => {
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
        boostHubToggleSettingsEventEmitter.dispatch()
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
        'cloud.user': null,
      })
      setGeneralStatus({
        boostHubTeams: [],
      })
    }

    boostHubTeamCreateEventEmitter.listen(boostHubTeamCreateEventHandler)
    boostHubTeamUpdateEventEmitter.listen(boostHubTeamUpdateEventHandler)
    boostHubTeamDeleteEventEmitter.listen(boostHubTeamDeleteEventHandler)
    boostHubAccountDeleteEventEmitter.listen(boostHubAccountDeleteEventHandler)
    return () => {
      boostHubTeamCreateEventEmitter.unlisten(boostHubTeamCreateEventHandler)
      boostHubTeamUpdateEventEmitter.unlisten(boostHubTeamUpdateEventHandler)
      boostHubTeamDeleteEventEmitter.unlisten(boostHubTeamDeleteEventHandler)
      boostHubAccountDeleteEventEmitter.unlisten(
        boostHubAccountDeleteEventHandler
      )
    }
  }, [push, setPreferences, setGeneralStatus])
  const { boostHubTeams } = generalStatus
  const switchWorkspaceHandler = useCallback(
    (_event: any, index: number) => {
      const storageIds = keys(storageMap)
      const boostHubDomains = boostHubTeams.map((team) => team.domain)

      if (storageIds.length > index) {
        const targetStorageId = storageIds[index]
        navigateToStorage(targetStorageId)
      } else {
        const targetDomain = boostHubDomains[index - storageIds.length]
        if (targetDomain == null) {
          return
        }

        push(`/app/boosthub/teams/${targetDomain}`)
      }
    },
    [storageMap, boostHubTeams, navigateToStorage, push]
  )
  useEffect(() => {
    addIpcListener('switch-workspace', switchWorkspaceHandler)
    return () => {
      removeIpcListener('switch-workspace', switchWorkspaceHandler)
    }
  }, [switchWorkspaceHandler])

  useBoostNoteProtocol()

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
        <ExternalStyle />
      </AppContainer>
    </ThemeProvider>
  )
}

export default App
