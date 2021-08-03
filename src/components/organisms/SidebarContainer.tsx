import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import { usePreferences } from '../../lib/preferences'
import { NoteStorage } from '../../lib/db/types'
import {
  openContextMenu,
  addIpcListener,
  removeIpcListener,
} from '../../lib/electronOnly'
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
import { useSearchModal } from '../../lib/searchModal'
import styled from '../../shared/lib/styled'
import cc from 'classcat'
import { useGeneralStatus } from '../../lib/generalStatus'
import { AppUser } from '../../shared/lib/mappers/users'
import { useLocalUI } from '../../lib/v2/hooks/local/useLocalUI'
import {
  mapTree,
  SidebarTreeSortingOrders,
} from '../../lib/v2/mappers/local/sidebarTree'
import { useLocalDB } from '../../lib/v2/hooks/local/useLocalDB'
import { useLocalDnd } from '../../lib/v2/hooks/local/useLocalDnd'
import { CollapsableType } from '../../lib/v2/stores/sidebarCollapse'
import { useSidebarCollapse } from '../../lib/v2/stores/sidebarCollapse'
import { mapLocalSpace } from '../../lib/v2/mappers/local/sidebarSpaces'
import { osName } from '../../shared/lib/platform'
import {
  SidebarSpace,
  SidebarSpaceContentRow,
} from '../../shared/components/organisms/Sidebar/molecules/SidebarSpaces'
import { useBoostHub } from '../../lib/boosthub'
import Sidebar from '../../shared/components/organisms/Sidebar'
import SidebarHeader, {
  SidebarControls,
} from '../../shared/components/organisms/Sidebar/atoms/SidebarHeader'
import plur from 'plur'

interface SidebarContainerProps {
  workspace?: NoteStorage
}

const SidebarContainer = ({ workspace }: SidebarContainerProps) => {
  const { storageMap } = useDb()
  const { push, pathname } = useRouter()
  const { navigate } = useStorageRouter()
  const { preferences, togglePreferencesModal } = usePreferences()
  const routeParams = useRouteParams() as
    | LocalSpaceRouteParams
    | BoostHubTeamsShowRouteParams
  const { t } = useTranslation()
  const boostHubUserInfo = preferences['cloud.user']
  const { signOut } = useBoostHub()
  const {
    createFolderApi,
    createDocApi,
    deleteFolderApi,
    toggleDocArchived,
    toggleDocBookmark,
  } = useLocalDB()
  const {
    openWorkspaceEditForm,
    openRenameFolderForm,
    openRenameDocForm,
    removeWorkspace,
    exportDocuments,
  } = useLocalUI()
  const { draggedResource, dropInDocOrFolder } = useLocalDnd()
  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const [showSpaces, setShowSpaces] = useState(false)
  const usersMap = new Map<string, AppUser>()
  const [initialLoadDone] = useState(true)
  const {
    sideBarOpenedLinksIdsSet,
    sideBarOpenedFolderIdsSet,
    toggleItem,
    unfoldItem,
    foldItem,
  } = useSidebarCollapse()

  const localSpaces = useMemo(() => values(storageMap), [storageMap])

  const openStorageContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (workspace == null) {
        return
      }

      const workspaceId = workspace.id
      openContextMenu({
        menuItems: [
          {
            type: 'normal',
            label: t('storage.rename'),
            click: () => openWorkspaceEditForm(workspace),
          },
          {
            type: 'normal',
            label: 'New Space',
            click: () => {
              push('/app/storages')
            },
          },
          {
            type: 'separator',
          },
          {
            type: 'normal',
            label: 'Export Folder',
            click: () =>
              exportDocuments(workspace, {
                folderName: workspace.name,
                folderPathname: '/',
                exportingStorage: true,
              }),
          },
          {
            type: 'normal',
            label: 'Preferences',
            click: () => {
              togglePreferencesModal()
            },
          },
          {
            type: 'separator',
          },
          ...localSpaces
            .filter((storage) => {
              return storage.id !== workspaceId
            })
            .map<MenuItemConstructorOptions>((storage) => {
              return {
                type: 'normal',
                label: `Switch to ${storage.name} storage`,
                click: () => {
                  navigate(storage.id)
                },
              }
            }),
          {
            type: 'separator',
          },
          {
            type: 'normal',
            label: t('storage.remove'),
            click: () => removeWorkspace(workspace),
          },
        ],
      })
    },
    [
      workspace,
      t,
      localSpaces,
      openWorkspaceEditForm,
      push,
      exportDocuments,
      togglePreferencesModal,
      navigate,
      removeWorkspace,
    ]
  )

  const { toggleShowSearchModal } = useSearchModal()

  useEffect(() => {
    const handler = () => {
      toggleShowSearchModal()
    }
    addIpcListener('search', handler)
    return () => {
      removeIpcListener('search', handler)
    }
  }, [toggleShowSearchModal])

  const sidebarResize = useCallback(
    (width: number) => setGeneralStatus({ sideBarWidth: width }),
    [setGeneralStatus]
  )

  const getFoldEvents = useCallback(
    (type: CollapsableType, key: string) => {
      return {
        fold: () => foldItem(type, key),
        unfold: () => unfoldItem(type, key),
        toggle: () => toggleItem(type, key),
      }
    },
    [foldItem, unfoldItem, toggleItem]
  )

  const tree = useMemo(() => {
    if (workspace == null) {
      return undefined
    }
    return mapTree(
      initialLoadDone,
      generalStatus.sidebarTreeSortingOrder,
      workspace,
      workspace.noteMap,
      workspace.folderMap,
      workspace.tagMap,
      pathname,
      sideBarOpenedLinksIdsSet,
      sideBarOpenedFolderIdsSet,
      toggleItem,
      getFoldEvents,
      push,
      toggleDocBookmark,
      toggleDocArchived,
      deleteFolderApi,
      createFolderApi,
      createDocApi,
      draggedResource,
      dropInDocOrFolder,
      openRenameFolderForm,
      openRenameDocForm,
      exportDocuments
    )
  }, [
    workspace,
    initialLoadDone,
    generalStatus.sidebarTreeSortingOrder,
    pathname,
    sideBarOpenedLinksIdsSet,
    sideBarOpenedFolderIdsSet,
    toggleItem,
    getFoldEvents,
    push,
    toggleDocBookmark,
    toggleDocArchived,
    deleteFolderApi,
    createFolderApi,
    createDocApi,
    draggedResource,
    dropInDocOrFolder,
    openRenameFolderForm,
    openRenameDocForm,
    exportDocuments,
  ])

  const sidebarHeaderControls: SidebarControls = useMemo(() => {
    return {
      'View Options': (tree || []).map((category) => {
        return {
          type: 'check',
          label: category.label,
          checked: !sideBarOpenedLinksIdsSet.has(`hide-${category.label}`),
          onClick: () => toggleItem('links', `hide-${category.label}`),
        }
      }),
      Sorting: Object.values(SidebarTreeSortingOrders).map((sort) => {
        return {
          type: 'radio',
          label: sort.label,
          icon: sort.icon,
          checked: sort.value === generalStatus.sidebarTreeSortingOrder,
          onClick: () =>
            setGeneralStatus({
              sidebarTreeSortingOrder: sort.value,
            }),
        }
      }),
    }
  }, [
    tree,
    generalStatus.sidebarTreeSortingOrder,
    setGeneralStatus,
    sideBarOpenedLinksIdsSet,
    toggleItem,
  ])

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
          label: t('storage.rename'),
          click: () => openWorkspaceEditForm(space),
        },
        { type: 'separator' },
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
    openWorkspaceEditForm,
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
        controls={sidebarHeaderControls}
      />
    )
  }, [activeSpace, sidebarHeaderControls])

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
