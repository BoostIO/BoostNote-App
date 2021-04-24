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
import { entries, getTimelineHref, values } from '../../lib/db/utils'
import { MenuItemConstructorOptions } from 'electron'
import { useStorageRouter } from '../../lib/storageRouter'
import { useRouteParams } from '../../lib/routeParams'
import {
  mdiFolderOutline,
  mdiLogin,
  mdiLogout,
  mdiMenu,
  mdiMessageQuestion,
  mdiPlus,
  mdiTextBoxPlusOutline,
} from '@mdi/js'
import { noteDetailFocusTitleInputEventEmitter } from '../../lib/events'
import { useTranslation } from 'react-i18next'
import { useSearchModal } from '../../lib/searchModal'
import styled from '../../shared/lib/styled'
import Button from '../../shared/components/atoms/Button'
import Sidebar from '../../shared/components/organisms/Sidebar'
import cc from 'classcat'
import {
  SidebarState,
  SidebarTreeSortingOrders,
} from '../../shared/lib/sidebar'
import { MenuTypes, useContextMenu } from '../../shared/lib/stores/contextMenu'
import { SidebarToolbarRow } from '../../shared/components/organisms/Sidebar/molecules/SidebarToolbar'
import { mapToolbarRows } from '../../lib/v2/mappers/local/sidebarRows'
import { useGeneralStatus } from '../../lib/generalStatus'
import { mapHistory } from '../../lib/v2/mappers/local/sidebarHistory'
import { SidebarSearchResult } from '../../shared/components/organisms/Sidebar/molecules/SidebarSearch'
import { AppUser } from '../../shared/lib/mappers/users'
import useApi from '../../shared/lib/hooks/useApi'
import { useDebounce } from 'react-use'
import {
  GetSearchResultsRequestQuery,
  NoteSearchData,
} from '../../lib/search/search'
import {
  getSearchResultItems,
  mapSearchResults,
} from '../../lib/v2/mappers/local/searchResults'
import { useLocalUI } from '../../lib/v2/hooks/local/useLocalUI'
import { mapTree } from '../../lib/v2/mappers/local/sidebarTree'
import { useLocalDB } from '../../lib/v2/hooks/local/useLocalDB'
import { useLocalDnd } from '../../lib/v2/hooks/local/useLocalDnd'
import { CollapsableType } from '../../lib/v2/stores/sidebarCollapse'
import { useSidebarCollapse } from '../../lib/v2/stores/sidebarCollapse'
import { useCloudIntroModal } from '../../lib/cloudIntroModal'
import { mapLocalSpace } from '../../lib/v2/mappers/local/sidebarSpaces'
import { osName } from '../../shared/lib/platform'
import { mapTimelineItems } from '../../lib/v2/mappers/local/timelineRows'
import {
  SidebarSpace,
  SidebarSpaceContentRow,
} from '../../shared/components/organisms/Sidebar/molecules/SidebarSpaces'
import { useBoostHub } from '../../lib/boosthub'
import { DialogIconTypes, useDialog } from '../../shared/lib/stores/dialog'
import BasicInputFormLocal from '../v2/organisms/BasicInputFormLocal'
import { useToast } from '../../shared/lib/stores/toast'
import { useModal } from '../../shared/lib/stores/modal'

interface SidebarContainerProps {
  hideSidebar?: boolean
  initialSidebarState?: SidebarState
  storage?: NoteStorage
}

const SidebarContainer = ({
  initialSidebarState,
  storage,
  hideSidebar,
}: SidebarContainerProps) => {
  const {
    createNote,
    createStorage,
    storageMap,
    renameStorage,
    removeStorage,
  } = useDb()
  const { pushMessage } = useToast()
  const { openModal, closeLastModal } = useModal()
  const { messageBox } = useDialog()
  const { push, hash, pathname } = useRouter()
  const { navigate } = useStorageRouter()
  const { preferences, openTab, togglePreferencesModal } = usePreferences()
  const routeParams = useRouteParams()
  const { t } = useTranslation()
  const boostHubUserInfo = preferences['cloud.user']
  const { signOut } = useBoostHub()

  // todo: [komediruzecki-22/05/2021] add this to local UI as well
  const openCreateStorageDialog = useCallback(() => {
    openModal(
      <BasicInputFormLocal
        defaultIcon={mdiFolderOutline}
        defaultInputValue={''}
        defaultEmoji={undefined}
        placeholder='Workspace name'
        submitButtonProps={{
          label: 'Create Space',
        }}
        onSubmit={async (workspaceName: string) => {
          if (workspaceName == '') {
            pushMessage({
              title: 'Cannot rename workspace',
              description: 'Workspace name should not be empty.',
            })
            closeLastModal()
            return
          }
          const storage = await createStorage(workspaceName)
          push(`/app/storages/${storage.id}/notes`)
          closeLastModal()
        }}
      />,
      {
        showCloseIcon: true,
        title: 'Create a space',
      }
    )
  }, [closeLastModal, createStorage, openModal, push, pushMessage])

  const openStorageContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (storage == null) {
        return
      }
      event.preventDefault()
      event.stopPropagation()

      const storages = values(storageMap)
      const workspaceId = storage.id
      openContextMenu({
        menuItems: [
          {
            type: 'normal',
            label: t('storage.rename'),
            click: async () => {
              openModal(
                <BasicInputFormLocal
                  defaultIcon={mdiMessageQuestion}
                  defaultInputValue={storage.name}
                  submitButtonProps={{
                    label: t('storage.rename'),
                  }}
                  onSubmit={async (workspaceName: string) => {
                    if (workspaceName == '') {
                      pushMessage({
                        title: 'Cannot rename workspace',
                        description: 'Workspace name should not be empty.',
                      })
                      closeLastModal()
                      return
                    }
                    renameStorage(storage.id, workspaceName)
                    closeLastModal()
                  }}
                />,
                {
                  showCloseIcon: true,
                  title: `Rename "${storage.name}" Space`,
                }
              )
            },
          },
          {
            type: 'normal',
            label: t('storage.remove'),
            click: async () => {
              messageBox({
                title: `Remove "${storage.name}" Space`,
                message:
                  storage.type === 'fs'
                    ? "This operation won't delete the actual space folder. You can add it to the app again."
                    : t('storage.removeMessage'),
                iconType: DialogIconTypes.Warning,
                buttons: [
                  {
                    label: t('storage.remove'),
                    onClick: () => {
                      removeStorage(storage.id)
                    },
                  },
                  { label: t('general.cancel') },
                ],
              })
            },
          },
          {
            type: 'separator',
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
          ...storages
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
            label: 'New Space',
            click: () => {
              openCreateStorageDialog()
            },
          },
        ],
      })
    },
    [
      storage,
      storageMap,
      t,
      openModal,
      renameStorage,
      closeLastModal,
      pushMessage,
      messageBox,
      removeStorage,
      togglePreferencesModal,
      navigate,
      openCreateStorageDialog,
    ]
  )

  // const extraNewNoteLabel = useMemo<React.ReactNode | null>(() => {
  //   switch (routeParams.name) {
  //     case 'storages.notes':
  //       if (routeParams.folderPathname !== '/') {
  //         return (
  //           <>
  //             in <Icon className='icon' path={mdiFolderOutline} />{' '}
  //             {getFolderNameFromPathname(routeParams.folderPathname)}
  //           </>
  //         )
  //       }
  //       break
  //     case 'storages.tags.show':
  //       return (
  //         <>
  //           with <Icon className='icon' path={mdiTag} />
  //           {routeParams.tagName}
  //         </>
  //       )
  //   }
  //   return null
  // }, [routeParams])

  const createNoteByRoute = useCallback(async () => {
    if (storage == null) {
      return
    }
    const workspaceId = storage.id
    let folderPathname = '/'
    let tags: string[] = []
    let baseHrefAfterCreate = `/app/storages/${workspaceId}/notes`
    switch (routeParams.name) {
      case 'workspaces.labels.show':
        tags = [routeParams.tagName]
        baseHrefAfterCreate = `/app/storages/${workspaceId}/tags/${routeParams.tagName}`
        break
      case 'workspaces.notes':
        if (routeParams.folderPathname !== '/') {
          folderPathname = routeParams.folderPathname
          baseHrefAfterCreate = `/app/storages/${workspaceId}/notes${folderPathname}`
        }
        break
    }

    const note = await createNote(workspaceId, {
      folderPathname,
      tags,
    })
    if (note == null) {
      return
    }

    push(`${baseHrefAfterCreate}/${note._id}#new`)
  }, [storage, routeParams, push, createNote])

  useEffect(() => {
    if (hash === '#new') {
      push({ hash: '' })
      setImmediate(() => {
        noteDetailFocusTitleInputEventEmitter.dispatch()
      })
    }
  }, [push, hash])

  useEffect(() => {
    const handler = () => {
      createNoteByRoute()
    }
    addIpcListener('new-note', handler)
    return () => {
      removeIpcListener('new-note', handler)
    }
  }, [createNoteByRoute])

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

  // Sidebar related items - properly implement after mapping
  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const { popup } = useContextMenu()
  const [showSpaces, setShowSpaces] = useState(false)
  const [sidebarState, setSidebarState] = useState<SidebarState | undefined>(
    hideSidebar != null && hideSidebar
      ? undefined
      : initialSidebarState != null
      ? initialSidebarState
      : generalStatus.lastSidebarState
  )
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')

  useEffect(() => {
    setGeneralStatus({ lastSidebarState: sidebarState })
  }, [sidebarState, setSidebarState, setGeneralStatus])

  const openState = useCallback((state: SidebarState) => {
    setSidebarState((prev) => (prev === state ? undefined : state))
  }, [])
  const { toggleShowingCloudIntroModal } = useCloudIntroModal()

  const toolbarRows: SidebarToolbarRow[] = useMemo(() => {
    if (storage != null) {
      return mapToolbarRows(
        showSpaces,
        setShowSpaces,
        openState,
        openTab,
        toggleShowingCloudIntroModal,
        sidebarState,
        storage
      )
    } else {
      return [
        {
          tooltip: 'Spaces',
          active: showSpaces,
          icon: mdiMenu,
          onClick: () => setShowSpaces((prev) => !prev),
        },
      ] as SidebarToolbarRow[]
    }
  }, [
    openState,
    openTab,
    showSpaces,
    sidebarState,
    storage,
    toggleShowingCloudIntroModal,
  ])

  const localSpaces = values(storageMap)
  const sidebarResize = useCallback(
    (width: number) => setGeneralStatus({ sideBarWidth: width }),
    [setGeneralStatus]
  )
  const setSearchQuery = useCallback((val: string) => {
    setSidebarSearchQuery(val)
  }, [])

  const historyItems = useMemo(() => {
    if (storage == null) {
      return []
    }
    return mapHistory(
      // implement history items for search
      [],
      push,
      storage.noteMap,
      storage.folderMap,
      storage
    )
  }, [push, storage])
  const { submit: submitSearch, sending: fetchingSearchResults } = useApi<
    { query: any },
    { results: NoteSearchData[] }
  >({
    api: ({ query }: { query: any }) => {
      // return new Promise(() => {
      return Promise.resolve({
        results: getSearchResultItems(storage, query.query),
      })
      // })
    },
    cb: ({ results }) => {
      // console.log('got results', results)
      setSearchResults(mapSearchResults(results, push, storage))
    },
  })

  const [isNotDebouncing, cancel] = useDebounce(
    async () => {
      if (storage == null || sidebarSearchQuery.trim() === '') {
        return
      }

      if (fetchingSearchResults) {
        cancel()
      }

      const searchParams = sidebarSearchQuery
        .split(' ')
        .reduce<GetSearchResultsRequestQuery>(
          (params, str) => {
            if (str === '--body') {
              params.body = true
              return params
            }
            if (str === '--title') {
              params.title = true
              return params
            }
            params.query = params.query == '' ? str : `${params.query} ${str}`
            return params
          },
          { query: '' }
        )

      // todo: implement search history for local space
      // addToSearchHistory(searchParams.query)
      await submitSearch({ query: searchParams })
    },
    600,
    [sidebarSearchQuery]
  )

  const [searchResults, setSearchResults] = useState<SidebarSearchResult[]>([])
  const usersMap = new Map<string, AppUser>()
  const [initialLoadDone] = useState(true)
  const {
    sideBarOpenedLinksIdsSet,
    sideBarOpenedFolderIdsSet,
    sideBarOpenedStorageIdsSet,
    toggleItem,
    unfoldItem,
    foldItem,
  } = useSidebarCollapse()

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
  const {
    updateFolder,
    updateDocApi,
    createFolder,
    createDocApi,
    deleteFolderApi,
    toggleDocArchived,
    toggleDocBookmark,
    deleteStorageApi,
  } = useLocalDB()
  const {
    openWorkspaceEditForm,
    openNewDocForm,
    openRenameFolderForm,
    openRenameDocForm,
    // deleteWorkspace,
  } = useLocalUI()
  const { draggedResource, dropInDocOrFolder, dropInWorkspace } = useLocalDnd()
  const tree = useMemo(() => {
    if (storage == null) {
      return undefined
    }
    return mapTree(
      initialLoadDone,
      generalStatus.sidebarTreeSortingOrder,
      storage,
      storage.noteMap,
      storage.folderMap,
      storage.tagMap,
      pathname,
      sideBarOpenedLinksIdsSet,
      sideBarOpenedFolderIdsSet,
      sideBarOpenedStorageIdsSet,
      toggleItem,
      getFoldEvents,
      push,
      toggleDocBookmark,
      deleteStorageApi,
      toggleDocArchived,
      deleteFolderApi,
      createFolder,
      createDocApi,
      draggedResource,
      dropInDocOrFolder,
      (id: string) => dropInWorkspace(id, updateFolder, updateDocApi),
      openRenameFolderForm,
      openRenameDocForm,
      openWorkspaceEditForm
    )
  }, [
    initialLoadDone,
    generalStatus.sidebarTreeSortingOrder,
    storage,
    pathname,
    sideBarOpenedLinksIdsSet,
    sideBarOpenedFolderIdsSet,
    sideBarOpenedStorageIdsSet,
    toggleItem,
    getFoldEvents,
    push,
    toggleDocBookmark,
    deleteStorageApi,
    toggleDocArchived,
    deleteFolderApi,
    createFolder,
    createDocApi,
    draggedResource,
    dropInDocOrFolder,
    openRenameFolderForm,
    openRenameDocForm,
    openWorkspaceEditForm,
    dropInWorkspace,
    updateFolder,
    updateDocApi,
  ])

  const activeBoostHubTeamDomain = useMemo<string | null>(() => {
    if (routeParams.name !== 'boosthub.teams.show') {
      return null
    }
    return routeParams.domain
  }, [routeParams])

  const spaces = useMemo(() => {
    const activeWorkspaceId: string | null = storage == null ? null : storage.id
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
      workspace: NoteStorage
    ) => {
      event.preventDefault()
      event.stopPropagation()
      const menuItems: MenuItemConstructorOptions[] = [
        {
          type: 'normal',
          label: t('storage.rename'),
          click: async () => {
            openModal(
              <BasicInputFormLocal
                defaultIcon={mdiMessageQuestion}
                defaultInputValue={workspace.name}
                submitButtonProps={{
                  label: t('storage.rename'),
                }}
                onSubmit={async (workspaceName: string) => {
                  if (workspaceName == '') {
                    pushMessage({
                      title: 'Cannot rename workspace',
                      description: 'Workspace name should not be empty.',
                    })
                    closeLastModal()
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
              // todo: [komediruzecki-22/05/2021] Test, maybe move to localUI and test remove..
              buttons: [
                {
                  label: t('storage.remove'),
                  onClick: () => {
                    removeStorage(workspace.id)
                  },
                },
                { label: t('general.cancel') },
              ],
            })
          },
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
      allSpaces.push({
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

    return allSpaces
  }, [
    activeBoostHubTeamDomain,
    closeLastModal,
    generalStatus.boostHubTeams,
    localSpaces,
    messageBox,
    navigate,
    openModal,
    push,
    pushMessage,
    removeStorage,
    renameStorage,
    storage,
    storageMap,
    t,
  ])

  const timelineRows = useMemo(() => {
    if (storage == null) {
      return []
    }
    return mapTimelineItems(values(storage.noteMap), push, storage)
  }, [push, storage])

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

  return (
    <NavigatorContainer onContextMenu={openStorageContextMenu}>
      <Sidebar
        className={cc(['application__sidebar'])}
        showToolbar={true}
        showSpaces={showSpaces}
        onSpacesBlur={() => setShowSpaces(false)}
        toolbarRows={toolbarRows}
        spaces={spaces}
        spaceBottomRows={spaceBottomRows}
        sidebarExpandedWidth={generalStatus.sideBarWidth}
        sidebarState={sidebarState}
        tree={tree}
        sidebarResize={sidebarResize}
        searchQuery={sidebarSearchQuery}
        setSearchQuery={setSearchQuery}
        // todo: add search history for local space (or use general search history when a shared component)
        searchHistory={[]}
        recentPages={historyItems}
        treeControls={[
          {
            icon:
              generalStatus.sidebarTreeSortingOrder === 'a-z'
                ? SidebarTreeSortingOrders.aZ.icon
                : generalStatus.sidebarTreeSortingOrder === 'z-a'
                ? SidebarTreeSortingOrders.zA.icon
                : generalStatus.sidebarTreeSortingOrder === 'last-updated'
                ? SidebarTreeSortingOrders.lastUpdated.icon
                : SidebarTreeSortingOrders.dragDrop.icon,
            onClick: (event) => {
              popup(
                event,
                Object.values(SidebarTreeSortingOrders).map((sort) => {
                  return {
                    type: MenuTypes.Normal,
                    onClick: () =>
                      setGeneralStatus({
                        sidebarTreeSortingOrder: sort.value,
                      }),
                    label: sort.label,
                    icon: sort.icon,
                    active:
                      sort.value === generalStatus.sidebarTreeSortingOrder,
                  }
                })
              )
            },
          },
        ]}
        // todo: See why its not full width
        treeTopRows={
          storage == null ? null : (
            <Button
              variant='primary'
              size={'sm'}
              iconPath={mdiTextBoxPlusOutline}
              id='sidebar-newdoc-btn'
              iconSize={16}
              onClick={() =>
                openNewDocForm({
                  parentFolderPathname: '/',
                  workspaceId: storage.id,
                })
              }
            >
              Create new doc
            </Button>
          )
        }
        searchResults={searchResults}
        // todo: no users?
        users={usersMap}
        timelineRows={timelineRows}
        timelineMore={
          storage != null
            ? {
                variant: 'primary',
                onClick: () => push(getTimelineHref(storage)),
              }
            : undefined
        }
        sidebarSearchState={{
          fetching: fetchingSearchResults,
          isNotDebouncing: isNotDebouncing() === true,
        }}
      />
    </NavigatorContainer>
  )
}

export default SidebarContainer

const NavigatorContainer = styled.nav`
  //flex: 0 0 auto;
  //min-width: 0;
`
