import React, { useEffect, useMemo, useState } from 'react'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import { mdiLogin, mdiLogout, mdiPlus } from '@mdi/js'
import { useRouter } from '../../lib/router'
import { useActiveStorageId, useRouteParams } from '../../lib/routeParams'
import { usePreferences } from '../../lib/preferences'
import { openContextMenu, setBadgeCount } from '../../lib/electronOnly'
import { osName } from '../../lib/platform'
import { useGeneralStatus } from '../../lib/generalStatus'
import { useBoostHub } from '../../lib/boosthub'
import SidebarSpaces, {
  SidebarSpace,
  SidebarSpaceContentRow,
} from '../../design/components/organisms/Sidebar/molecules/SidebarSpaces'
import { useStorageRouter } from '../../lib/storageRouter'
import { MenuItemConstructorOptions } from 'electron/main'
import { useTranslation } from 'react-i18next'
import {
  boosthubNotificationCountsEventEmitter,
  boostHubSidebarSpaceEventEmitter,
} from '../../lib/events'
import CloudIntroModal from './CloudIntroModal'
import { useCloudIntroModal } from '../../lib/cloudIntroModal'
import { DialogIconTypes, useDialog } from '../../design/lib/stores/dialog'
import styled from '../../design/lib/styled'
import SidebarPopOver from '../../design/components/organisms/Sidebar/atoms/SidebarPopOver'

const TopLevelNavigator = () => {
  const { storageMap, removeStorage } = useDb()
  const { push } = useRouter()
  const { preferences } = usePreferences()
  const { generalStatus } = useGeneralStatus()
  const routeParams = useRouteParams()
  const { signOut } = useBoostHub()
  const { navigate } = useStorageRouter()
  const { messageBox } = useDialog()
  const { t } = useTranslation()
  const [showSpaces, setShowSpaces] = useState(false)
  const boostHubUserInfo = preferences['cloud.user']
  const activeStorageId = useActiveStorageId()
  const { showingCloudIntroModal } = useCloudIntroModal()
  const [notificationCounts, setNotificationCounts] = useState<
    Record<string, number>
  >({})

  useEffect(() => {
    const handler = (event: CustomEvent<Record<string, number>>) => {
      setNotificationCounts(event.detail)
    }
    boosthubNotificationCountsEventEmitter.listen(handler)
    return () => boosthubNotificationCountsEventEmitter.unlisten(handler)
  }, [])

  useEffect(() => {
    setBadgeCount(
      Object.values(notificationCounts).reduce((prev, curr) => prev + curr, 0)
    )
  }, [notificationCounts])

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
        label: 'Sign Out',
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

  useEffect(() => {
    const boostHubSidebarSpaceEventHandler = () => {
      setShowSpaces(true)
    }

    boostHubSidebarSpaceEventEmitter.listen(boostHubSidebarSpaceEventHandler)
    return () => {
      boostHubSidebarSpaceEventEmitter.unlisten(
        boostHubSidebarSpaceEventHandler
      )
    }
  }, [])

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
    messageBox,
    removeStorage,
    activeBoostHubTeamDomain,
    push,
  ])

  return (
    <Container>
      {showSpaces && (
        <SidebarPopOver onClose={() => setShowSpaces(false)}>
          <SidebarSpaces
            className='sidebar__spaces'
            spaces={spaces}
            spaceBottomRows={spaceBottomRows}
            onSpacesBlur={() => setShowSpaces(false)}
          />
        </SidebarPopOver>
      )}
      {showingCloudIntroModal && <CloudIntroModal />}
    </Container>
  )
}

export default TopLevelNavigator

const Container = styled.div``
