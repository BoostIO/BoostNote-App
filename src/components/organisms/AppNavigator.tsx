import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  mdiMenu,
  mdiCloudOffOutline,
  mdiGiftOutline,
  mdiMessageQuestion,
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
} from '../../shared/components/organisms/Sidebar/molecules/SidebarToolbar'
import SidebarSpaces, {
  SidebarSpace,
  SidebarSpaceContentRow,
} from '../../shared/components/organisms/Sidebar/molecules/SidebarSpaces'
import { useStorageRouter } from '../../lib/storageRouter'
import { MenuItemConstructorOptions } from 'electron/main'
import { useTranslation } from 'react-i18next'
import RoundedImage from '../../shared/components/atoms/RoundedImage'
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
  boostHubOpenDiscountModalEventEmitter,
} from '../../lib/events'
import { useSearchModal } from '../../lib/searchModal'
import { SidebarState } from '../../shared/lib/sidebar'
import CloudIntroModal from './CloudIntroModal'
import { useCloudIntroModal } from '../../lib/cloudIntroModal'
import { isEligibleForDiscount } from '../../cloud/lib/subscription'
import { DialogIconTypes, useDialog } from '../../shared/lib/stores/dialog'
import BasicInputFormLocal from '../v2/organisms/BasicInputFormLocal'
import { useModal } from '../../shared/lib/stores/modal'
import { useToast } from '../../shared/lib/stores/toast'
import styled from '../../shared/lib/styled'

const TopLevelNavigator = () => {
  const { storageMap, renameStorage, removeStorage } = useDb()
  const { push } = useRouter()
  const { preferences, togglePreferencesModal } = usePreferences()
  const { generalStatus } = useGeneralStatus()
  const routeParams = useRouteParams()
  const { signOut } = useBoostHub()
  const { navigate } = useStorageRouter()
  const { messageBox } = useDialog()
  const { openModal, closeLastModal } = useModal()
  const { pushMessage } = useToast()
  const { t } = useTranslation()
  const [sidebarState, setSidebarState] = useState<SidebarState | undefined>(
    'tree'
  )
  const [showSpaces, setShowSpaces] = useState(false)
  const boostHubUserInfo = preferences['cloud.user']
  const activeStorageId = useActiveStorageId()
  const {
    showingCloudIntroModal,
    toggleShowingCloudIntroModal,
  } = useCloudIntroModal()

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

  const inputRef = useRef<HTMLInputElement>(null)
  const spaces = useMemo(() => {
    const spaces: SidebarSpace[] = []

    entries(storageMap).forEach(([workspaceId, workspace], index) => {
      spaces.push({
        label: workspace.name,
        active: activeStorageId === workspaceId,
        tooltip: `${osName === 'macos' ? '⌘' : 'Ctrl'} ${index + 1}`,
        linkProps: {
          onClick: (event) => {
            event.preventDefault()
            navigate(workspace.id)
          },
          onContextMenu: (event) => {
            event.preventDefault()
            event.stopPropagation()
            const menuItems: MenuItemConstructorOptions[] = [
              {
                type: 'normal',
                label: t('storage.rename'),
                click: async () => {
                  openModal(
                    <BasicInputFormLocal
                      inputRef={inputRef}
                      defaultIcon={mdiMessageQuestion}
                      defaultInputValue={workspace.name}
                      placeholder='Workspace name'
                      submitButtonProps={{
                        label: t('storage.rename'),
                      }}
                      onSubmit={async (workspaceName: string | null) => {
                        if (workspaceName == '' || workspaceName == null) {
                          pushMessage({
                            title: 'Cannot rename workspace',
                            description: 'Workspace name should not be empty.',
                          })
                          return
                        }
                        await renameStorage(workspace.id, workspaceName)
                        closeLastModal()
                      }}
                    />,
                    {
                      showCloseIcon: true,
                      title: `Rename "${workspace.name}" storage`,
                    }
                  )
                },
              },
              { type: 'separator' },
              {
                type: 'normal',
                label: t('storage.remove'),
                click: async () => {
                  messageBox({
                    title: `Remove "${workspace.name}" storage`,
                    message:
                      workspace.type === 'fs'
                        ? "This operation won't delete the actual storage folder. You can add it to the app again."
                        : t('storage.removeMessage'),
                    iconType: DialogIconTypes.Warning,
                    buttons: [
                      {
                        label: t('storage.remove'),
                        defaultButton: true,
                        onClick: () => {
                          removeStorage(workspace.id)
                        },
                      },
                      { label: t('general.cancel'), cancelButton: true },
                    ],
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
    storageMap,
    generalStatus.boostHubTeams,
    activeStorageId,
    navigate,
    t,
    openModal,
    renameStorage,
    closeLastModal,
    pushMessage,
    messageBox,
    removeStorage,
    activeBoostHubTeamDomain,
    push,
  ])

  const openState = useCallback((state: SidebarState) => {
    setSidebarState((prev) => (prev === state ? undefined : state))
  }, [])

  const { showSearchModal, toggleShowSearchModal } = useSearchModal()

  const toolbarRows = useMemo<SidebarToolbarRow[]>(() => {
    const boosthubTeam =
      activeBoostHubTeamDomain != null
        ? generalStatus.boostHubTeams.find(
            (team) => team.domain === activeBoostHubTeamDomain
          )
        : null

    if (boosthubTeam != null) {
      const rows: SidebarToolbarRow[] = [
        {
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
        },

        {
          tooltip: 'Tree',
          icon: mdiFileDocumentMultipleOutline,
          active: sidebarState === 'tree' && !showSpaces,
          onClick: boostHubToggleSidebarTreeEventEmitter.dispatch,
        },
        {
          tooltip: 'Search',
          active: sidebarState === 'search' && !showSpaces,
          icon: mdiMagnify,
          onClick: boostHubToggleSidebarSearchEventEmitter.dispatch,
        },
        {
          tooltip: 'Timeline',
          active: sidebarState === 'timeline' && !showSpaces,
          icon: mdiClockOutline,
          onClick: boostHubToggleSidebarTimelineEventEmitter.dispatch,
        },
      ]

      if (
        boosthubTeam.subscription == null &&
        isEligibleForDiscount(boosthubTeam)
      ) {
        rows.push({
          position: 'bottom',
          tooltip: 'Get the new user discount!',
          icon: mdiGiftOutline,
          pelletVariant: 'danger',
          onClick: boostHubOpenDiscountModalEventEmitter.dispatch,
        })
      }

      rows.push(
        ...([
          {
            tooltip: 'Import',
            icon: mdiDownload,
            position: 'bottom',
            onClick: boostHubOpenImportModalEventEmitter.dispatch,
          },
          {
            tooltip: 'Members',
            active: false,
            icon: mdiAccountMultiplePlusOutline,
            position: 'bottom',
            onClick: boostHubToggleSettingsMembersEventEmitter.dispatch,
          },
          {
            tooltip: 'Settings',
            active: false,
            icon: mdiCog,
            position: 'bottom',
            onClick: boostHubToggleSettingsEventEmitter.dispatch,
          },
        ] as SidebarToolbarRow[])
      )

      return rows
    }

    const activeStorage = values(storageMap).find(
      (storage) => activeStorageId === storage?.id
    )
    if (activeStorage) {
      return [
        {
          tooltip: 'Spaces',
          active: showSpaces,
          icon: <RoundedImage size={30} alt={activeStorage.name} />,
          onClick: () => setShowSpaces((prev) => !prev),
        },

        {
          tooltip: 'Tree',
          icon: mdiFileDocumentMultipleOutline,
          active: !showSearchModal && closed && !showSpaces,
          onClick: undefined,
        },
        {
          tooltip: 'Search',
          active: showSearchModal && closed && !showSpaces,
          icon: mdiMagnify,
          onClick: toggleShowSearchModal,
        },
        {
          tooltip: 'Timeline',
          active: sidebarState === 'timeline',
          icon: mdiClockOutline,
          onClick: () => openState('timeline'),
        },
        {
          tooltip: 'Cloud Space',
          active: false,
          position: 'bottom',
          icon: mdiCloudOffOutline,
          onClick: toggleShowingCloudIntroModal,
        },
        {
          tooltip: 'Settings',
          active: !closed && !showSpaces,
          position: 'bottom',
          icon: mdiCog,
          onClick: togglePreferencesModal,
        },
      ] as SidebarToolbarRow[]
    }

    return [
      {
        tooltip: 'Spaces',
        active: showSpaces,
        icon: mdiMenu,
        onClick: () => setShowSpaces((prev) => !prev),
      },
    ] as SidebarToolbarRow[]
  }, [
    activeBoostHubTeamDomain,
    generalStatus.boostHubTeams,
    storageMap,
    showSpaces,
    sidebarState,
    activeStorageId,
    showSearchModal,
    toggleShowSearchModal,
    toggleShowingCloudIntroModal,
    togglePreferencesModal,
    openState,
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
      {showingCloudIntroModal && <CloudIntroModal />}
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
