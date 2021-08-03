import React, { useCallback, useMemo, useState } from 'react'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import { usePreferences } from '../../lib/preferences'
import { NoteStorage } from '../../lib/db/types'
import { openContextMenu } from '../../lib/electronOnly'
import { values } from '../../lib/db/utils'
import { MenuItemConstructorOptions } from 'electron'
import { useStorageRouter } from '../../lib/storageRouter'
import {
  BoostHubTeamsShowRouteParams,
  LocalSpaceRouteParams,
  useRouteParams,
} from '../../lib/routeParams'
import { mdiLogin, mdiLogout, mdiPlus } from '@mdi/js'
import { useTranslation } from 'react-i18next'
import styled from '../../shared/lib/styled'
import cc from 'classcat'
import { useGeneralStatus } from '../../lib/generalStatus'
import { AppUser } from '../../shared/lib/mappers/users'
import { useLocalUI } from '../../lib/v2/hooks/local/useLocalUI'
import { mapLocalSpace } from '../../lib/v2/mappers/local/sidebarSpaces'
import { osName } from '../../shared/lib/platform'
import {
  SidebarSpace,
  SidebarSpaceContentRow,
} from '../../shared/components/organisms/Sidebar/molecules/SidebarSpaces'
import { useBoostHub } from '../../lib/boosthub'
import Sidebar from '../../shared/components/organisms/Sidebar'
import SidebarHeader from '../../shared/components/organisms/Sidebar/atoms/SidebarHeader'
import plur from 'plur'

interface SidebarContainerProps {
  workspace?: NoteStorage
}

const SidebarContainer = ({ workspace }: SidebarContainerProps) => {
  const { storageMap } = useDb()
  const { push } = useRouter()
  const { navigate } = useStorageRouter()
  const { preferences } = usePreferences()
  const routeParams = useRouteParams() as
    | LocalSpaceRouteParams
    | BoostHubTeamsShowRouteParams
  const { t } = useTranslation()
  const boostHubUserInfo = preferences['cloud.user']
  const { signOut } = useBoostHub()
  const { removeWorkspace } = useLocalUI()
  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const [showSpaces, setShowSpaces] = useState(false)
  const usersMap = new Map<string, AppUser>()

  const localSpaces = useMemo(() => values(storageMap), [storageMap])

  const openStorageContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (workspace == null) {
        return
      }

      openContextMenu({
        menuItems: [
          {
            type: 'normal',
            label: t('storage.remove'),
            click: () => removeWorkspace(workspace),
          },
        ],
      })
    },
    [workspace, t, removeWorkspace]
  )

  const sidebarResize = useCallback(
    (width: number) => setGeneralStatus({ sideBarWidth: width }),
    [setGeneralStatus]
  )

  const activeBoostHubTeamDomain = useMemo<string | null>(() => {
    if (routeParams.name !== 'boosthub.teams.show') {
      return null
    }
    return routeParams.domain
  }, [routeParams])

  const spaces = useMemo(() => {
    const activeWorkspaceId: string | null =
      workspace == null ? null : workspace.id
    const allSpaces: SidebarSpace[] = []
    const onSpaceLinkClick = (
      event: React.MouseEvent,
      workspace: NoteStorage
    ) => {
      event.preventDefault()
      navigate(workspace.id)
    }
    const onSpaceContextMenu = (
      event: React.MouseEvent,
      space: NoteStorage
    ) => {
      event.preventDefault()
      event.stopPropagation()
      const menuItems: MenuItemConstructorOptions[] = [
        {
          type: 'normal',
          label: t('storage.remove'),
          click: () => removeWorkspace(space),
        },
      ]
      openContextMenu({ menuItems })
    }

    localSpaces.forEach((workspace, index) => {
      allSpaces.push(
        mapLocalSpace(
          workspace,
          index,
          activeWorkspaceId,
          onSpaceLinkClick,
          onSpaceContextMenu
        )
      )
    })
    generalStatus.boostHubTeams.forEach((boostHubTeam, index) => {
      const roles = (boostHubTeam.permissions != null
        ? boostHubTeam.permissions
        : []
      ).reduce(
        (acc, val) => {
          if (val.role === 'viewer') {
            acc.viewers = acc.viewers + 1
          } else {
            acc.members = acc.members + 1
          }
          return acc
        },
        { viewers: 0, members: 0 }
      )

      allSpaces.push({
        label: boostHubTeam.name,
        icon: boostHubTeam.iconUrl,
        description: `${roles.members} ${plur('Member', roles.members)} ${
          roles.viewers > 0
            ? `- ${roles.viewers} ${plur('Viewer', roles.viewers)}`
            : ''
        }`,
        subscriptionPlan:
          boostHubTeam.subscription == null
            ? 'Free'
            : boostHubTeam.trial
            ? 'Trial'
            : boostHubTeam.subscription.plan,
        active: activeBoostHubTeamDomain === boostHubTeam.domain,
        tooltip: `${osName === 'macos' ? '⌘' : 'Ctrl'} ${
          localSpaces.length + index + 1
        }`,
        linkProps: {
          onClick: (event) => {
            event.preventDefault()
            push(`/app/boosthub/teams/${boostHubTeam.domain}`)
          },
        },
      })
    })

    return allSpaces
  }, [
    workspace,
    localSpaces,
    generalStatus.boostHubTeams,
    navigate,
    t,
    removeWorkspace,
    activeBoostHubTeamDomain,
    push,
  ])

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

  const activeSpace = spaces.find((space) => space.active)
  const sidebarHeader = useMemo(() => {
    return (
      <SidebarHeader
        onSpaceClick={() => setShowSpaces(true)}
        spaceName={activeSpace != null ? activeSpace.label : '...'}
        spaceImage={
          activeSpace != null && activeSpace.icon != null
            ? activeSpace.icon
            : undefined
        }
        controls={{}}
      />
    )
  }, [activeSpace])

  return (
    <NavigatorContainer onContextMenu={openStorageContextMenu}>
      <Sidebar
        className={cc(['application__sidebar'])}
        popOver={showSpaces ? 'spaces' : null}
        onSpacesBlur={() => setShowSpaces(false)}
        spaces={spaces}
        spaceBottomRows={spaceBottomRows}
        sidebarExpandedWidth={generalStatus.sideBarWidth}
        tree={[]}
        sidebarResize={sidebarResize}
        header={sidebarHeader}
        users={usersMap}
      />
    </NavigatorContainer>
  )
}

export default SidebarContainer

const NavigatorContainer = styled.nav``
