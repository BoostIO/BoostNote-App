import React, { useEffect, useMemo, useState } from 'react'
import styled from '../../lib/styled'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import {
  mdiAccountMultiplePlusOutline,
  mdiClockOutline,
  mdiCog,
  mdiDownload,
  mdiFileDocumentMultipleOutline,
  mdiLogin,
  mdiLogout,
  mdiMagnify,
  mdiPlus,
} from '@mdi/js'
import { useRouter } from '../../lib/router'
import { useActiveStorageId, useRouteParams } from '../../lib/routeParams'
import { usePreferences } from '../../lib/preferences'
import { openContextMenu } from '../../lib/electronOnly'
import { osName } from '../../lib/platform'
import { useGeneralStatus } from '../../lib/generalStatus'
import { useBoostHub } from '../../lib/boosthub'
import SidebarToolbar, {
  SidebarToolbarRow,
} from '../v2/organisms/Sidebar/molecules/SidebarToolbar'
import SidebarSpaces, {
  SidebarSpace,
  SidebarSpaceContentRow,
} from '../v2/organisms/Sidebar/molecules/SidebarSpaces'
import { useStorageRouter } from '../../lib/storageRouter'
import { MenuItemConstructorOptions } from 'electron/main'
import { DialogIconTypes, useDialog } from '../../lib/dialog'
import { useTranslation } from 'react-i18next'
import RoundedImage from '../v2/atoms/RoundedImage'
import { values } from 'ramda'
import {
  boostHubOpenImportModalEventEmitter,
  boostHubSidebarStateEvent,
  boostHubSidebarStateEventEmitter,
  boostHubToggleSettingsEventEmitter,
  boostHubToggleSettingsMembersEventEmitter,
  boostHubToggleSidebarSearchEventEmitter,
  boostHubToggleSidebarTimelineEventEmitter,
  boostHubToggleSidebarTreeEventEmitter,
} from '../../lib/events'
import { useSearchModal } from '../../lib/searchModal'
import { SidebarState } from '../../lib/v2/sidebar'

const TopLevelNavigator = () => {
  const { storageMap, renameStorage, removeStorage } = useDb()
  const { push } = useRouter()
  const { preferences, togglePreferencesModal, closed } = usePreferences()
  const { generalStatus } = useGeneralStatus()
  const routeParams = useRouteParams()
  const { signOut } = useBoostHub()
  const { navigate } = useStorageRouter()
  const { prompt, messageBox } = useDialog()
  const { t } = useTranslation()
  const { toggleShowSearchModal, showSearchModal } = useSearchModal()
  const [sidebarState, setSidebarState] = useState<SidebarState | undefined>(
    'tree'
  )
  const [showSpaces, setShowSpaces] = useState(false)
  const boostHubUserInfo = preferences['cloud.user']
  const activeStorageId = useActiveStorageId()

  useEffect(() => {
    const boostHubSidebarStateEventHandler = (
      event: boostHubSidebarStateEvent
    ) => {
      setSidebarState(event.detail.state)
    }

    boostHubSidebarStateEventEmitter.listen(boostHubSidebarStateEventHandler)
    return () => {
      boostHubSidebarStateEventEmitter.unlisten(
        boostHubSidebarStateEventHandler
      )
    }
  }, [])

  const activeBoostHubTeamDomain = useMemo<string | null>(() => {
    if (routeParams.name !== 'boosthub.teams.show') {
      return null
    }
    return routeParams.domain
  }, [routeParams])

  const spaceBottomRows = useMemo(() => {
    const rows: SidebarSpaceContentRow[] = []
    rows.push({
      label: 'Create Space',
      icon: mdiPlus,
      linkProps: {
        onClick: (event) => {
          event.preventDefault()
          if (boostHubUserInfo == null) {
            push('/app/boosthub/login')
          } else {
            push('/app/boosthub/teams')
          }
        },
      },
    })

    if (boostHubUserInfo == null) {
      rows.push({
        label: 'Sign in',
        icon: mdiLogin,
        linkProps: {
          onClick: (event) => {
            event.preventDefault()

            push('/app/boosthub/login')
          },
        },
      })
    } else {
      rows.push({
        label: 'Sign Out Team Account',
        icon: mdiLogout,
        linkProps: {
          onClick: (event) => {
            event.preventDefault()
            signOut()
          },
        },
      })
    }

    return rows
  }, [boostHubUserInfo, push, signOut])

  const spaces = useMemo(() => {
    const spaces: SidebarSpace[] = []

    entries(storageMap).forEach(([storageId, storage], index) => {
      spaces.push({
        label: storage.name,
        active: activeStorageId === storageId,
        tooltip: `${osName === 'macos' ? '⌘' : 'Ctrl'} ${index + 1}`,
        linkProps: {
          onClick: (event) => {
            event.preventDefault()
            navigate(storage.id)
          },
          onContextMenu: (event) => {
            event.preventDefault()
            event.stopPropagation()
            const menuItems: MenuItemConstructorOptions[] = [
              {
                type: 'normal',
                label: t('storage.rename'),
                click: async () => {
                  prompt({
                    title: `Rename "${storage.name}" storage`,
                    message: t('storage.renameMessage'),
                    iconType: DialogIconTypes.Question,
                    defaultValue: storage.name,
                    submitButtonLabel: t('storage.rename'),
                    onClose: async (value: string | null) => {
                      if (value == null) return
                      await renameStorage(storage.id, value)
                    },
                  })
                },
              },
              { type: 'separator' },
              {
                type: 'normal',
                label: t('storage.remove'),
                click: async () => {
                  messageBox({
                    title: `Remove "${storage.name}" storage`,
                    message:
                      storage.type === 'fs'
                        ? "This operation won't delete the actual storage folder. You can add it to the app again."
                        : t('storage.removeMessage'),
                    iconType: DialogIconTypes.Warning,
                    buttons: [t('storage.remove'), t('general.cancel')],
                    defaultButtonIndex: 0,
                    cancelButtonIndex: 1,
                    onClose: (value: number | null) => {
                      if (value === 0) {
                        removeStorage(storage.id)
                      }
                    },
                  })
                },
              },
            ]

            openContextMenu({ menuItems })
          },
        },
      })
    })

    generalStatus.boostHubTeams.forEach((boostHubTeam, index) => {
      spaces.push({
        label: boostHubTeam.name,
        icon: boostHubTeam.iconUrl,
        active: activeBoostHubTeamDomain === boostHubTeam.domain,
        tooltip: `${osName === 'macos' ? '⌘' : 'Ctrl'} ${
          entries(storageMap).length + index + 1
        }`,
        linkProps: {
          onClick: (event) => {
            event.preventDefault()
            push(`/app/boosthub/teams/${boostHubTeam.domain}`)
          },
        },
      })
    })

    return spaces
  }, [
    activeStorageId,
    storageMap,
    activeBoostHubTeamDomain,
    generalStatus.boostHubTeams,
    messageBox,
    prompt,
    removeStorage,
    renameStorage,
    navigate,
    push,
    t,
  ])

  const toolbarRows = useMemo(() => {
    const rows: SidebarToolbarRow[] = []

    const boosthubTeam =
      activeBoostHubTeamDomain != null
        ? generalStatus.boostHubTeams.find(
            (team) => team.domain === activeBoostHubTeamDomain
          )
        : null

    const activeStorage = values(storageMap).find(
      (storage) => activeStorageId === storage?.id
    )

    if (boosthubTeam != null) {
      rows.push({
        tooltip: 'Spaces',
        active: showSpaces,
        icon: (
          <RoundedImage
            size={30}
            alt={boosthubTeam.name}
            url={boosthubTeam.iconUrl}
          />
        ),
        onClick: () => setShowSpaces((prev) => !prev),
      })
    } else {
      rows.push({
        tooltip: 'Spaces',
        active: showSpaces,
        icon: <RoundedImage size={30} alt={activeStorage?.name || 'Spaces'} />,
        onClick: () => setShowSpaces((prev) => !prev),
      })
    }

    rows.push({
      tooltip: 'Tree',
      icon: mdiFileDocumentMultipleOutline,
      active:
        boosthubTeam == null
          ? !showSearchModal && closed && !showSpaces
          : sidebarState === 'tree' && !showSpaces,
      onClick:
        boosthubTeam != null
          ? boostHubToggleSidebarTreeEventEmitter.dispatch
          : undefined,
    })

    if (boosthubTeam != null) {
      rows.push({
        tooltip: 'Search',
        active: sidebarState === 'search' && !showSpaces,
        icon: mdiMagnify,
        onClick: boostHubToggleSidebarSearchEventEmitter.dispatch,
      })
    } else {
      rows.push({
        tooltip: 'Search',
        active: showSearchModal && closed && !showSpaces,
        icon: mdiMagnify,
        onClick: toggleShowSearchModal,
      })
    }

    if (boosthubTeam != null) {
      rows.push({
        tooltip: 'Timeline',
        active: sidebarState === 'timeline' && !showSpaces,
        icon: mdiClockOutline,
        onClick: boostHubToggleSidebarTimelineEventEmitter.dispatch,
      })

      rows.push({
        tooltip: 'Import',
        icon: mdiDownload,
        position: 'bottom',
        onClick: boostHubOpenImportModalEventEmitter.dispatch,
      })
      rows.push({
        tooltip: 'Members',
        active: false,
        icon: mdiAccountMultiplePlusOutline,
        position: 'bottom',
        onClick: boostHubToggleSettingsMembersEventEmitter.dispatch,
      })
    }

    if (boosthubTeam != null) {
      rows.push({
        tooltip: 'Settings',
        active: false,
        icon: mdiCog,
        position: 'bottom',
        onClick: boostHubToggleSettingsEventEmitter.dispatch,
      })
    } else {
      rows.push({
        tooltip: 'Settings',
        active: !closed && !showSpaces,
        position: 'bottom',
        icon: mdiCog,
        onClick: togglePreferencesModal,
      })
    }

    return rows
  }, [
    activeBoostHubTeamDomain,
    generalStatus.boostHubTeams,
    showSpaces,
    storageMap,
    activeStorageId,
    showSearchModal,
    closed,
    togglePreferencesModal,
    toggleShowSearchModal,
    sidebarState,
  ])

  return (
    <Container>
      <SidebarToolbar
        rows={toolbarRows}
        className='sidebar__toolbar'
        iconSize={26}
      />
      {showSpaces && (
        <SidebarSpaces
          className='sidebar__spaces'
          spaces={spaces}
          spaceBottomRows={spaceBottomRows}
          onSpacesBlur={() => setShowSpaces(false)}
        />
      )}
    </Container>
  )
}

export default TopLevelNavigator

const Container = styled.div`
  .sidebar__toolbar .sidebar__toolbar__top {
    .sidebar__toolbar__item:first-of-type {
      height: 32px;
    }
  }
`
