import React, { useCallback, useMemo } from 'react'
import {
  mdiCog,
  mdiFileDocumentOutline,
  mdiTextBoxPlus,
  mdiFolderPlusOutline,
  mdiLock,
  mdiPencil,
  mdiPlus,
  mdiStar,
  mdiStarOutline,
  mdiTag,
  mdiTrashCanOutline,
  mdiViewDashboard,
} from '@mdi/js'
import { FoldingProps } from '../../../../design/components/atoms/FoldingWrapper'
import { SidebarDragState } from '../../../../design/lib/dnd'
import {
  SidebarTreeSortingOrder,
  SidebarTreeSortingOrders,
} from '../../../../design/lib/sidebar'
import { MenuItem, MenuTypes } from '../../../../design/lib/stores/contextMenu'
import { useModal } from '../../../../design/lib/stores/modal'
import {
  getMapValues,
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../../design/lib/utils/array'
import { getDocLinkHref } from '../../../components/Link/DocLink'
import { getFolderHref } from '../../../components/Link/FolderLink'
import { getTagHref } from '../../../components/Link/TagLink'
import { getWorkspaceHref } from '../../../components/Link/WorkspaceLink'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { useRouter } from '../../router'
import {
  cloudSidebaCategoryLabels,
  cloudSidebarOrderedCategoriesDelimiter,
} from '../../sidebar'
import { useNav } from '../../stores/nav'
import { usePage } from '../../stores/pageStore'
import { usePreferences } from '../../stores/preferences'
import {
  CollapsableType,
  useSidebarCollapse,
} from '../../stores/sidebarCollapse'
import {
  docToDataTransferItem,
  folderToDataTransferItem,
  getDocId,
  getDocTitle,
  getFolderId,
} from '../../utils/patterns'
import { useCloudApi } from '../useCloudApi'
import { useCloudResourceModals } from '../useCloudResourceModals'
import { useCloudDnd } from './useCloudDnd'
import { DocStatus } from '../../../interfaces/db/doc'
import { useI18n } from '../useI18n'
import { lngKeys } from '../../i18n/types'
import {
  SidebarControl,
  SidebarControls,
} from '../../../../design/components/organisms/Sidebar/atoms/SidebarHeader'
import { useSearch } from '../../stores/search'
import {
  SidebarNavCategory,
  SidebarNavControls,
  SidebarTreeChildRow,
} from '../../../../design/components/organisms/Sidebar/molecules/SidebarTree'
import { CATEGORY_DRAG_TRANSFER_DATA_JSON } from '../../../interfaces/resources'
import LabelsManagementModal from '../../../components/Modal/contents/LabelsManagementModal'
import { useElectron } from '../../stores/electron'
import { isString } from '../../utils/string'
import { getDashboardHref } from '../../../components/Link/DashboardLink'
import UnlockDashboardModal from '../../../components/Modal/contents/Subscription/UnlockDashboardModal'
import { useBetaRegistration } from '../../stores/beta'
import { getTeamLinkHref } from '../../../components/Link/TeamLink'

export function useCloudSidebarTree() {
  const { team, currentUserIsCoreMember, subscription } = usePage()
  const { push, pathname } = useRouter()
  const { openModal } = useModal()
  const { preferences, setPreferences } = usePreferences()
  const { translate } = useI18n()
  const { showSearchScreen } = useSearch()
  const { sendToElectron, usingElectron } = useElectron()
  const betaRegistrationState = useBetaRegistration()

  const {
    initialLoadDone,
    docsMap,
    foldersMap,
    workspacesMap,
    tagsMap,
    dashboardsMap,
  } = useNav()

  const {
    sideBarOpenedLinksIdsSet,
    sideBarOpenedFolderIdsSet,
    sideBarOpenedWorkspaceIdsSet,
    toggleItem,
    unfoldItem,
    foldItem,
  } = useSidebarCollapse()

  const {
    dropInDocOrFolder,
    dropInWorkspace,
    saveFolderTransferData,
    saveDocTransferData,
    clearDragTransferData,
  } = useCloudDnd()

  const {
    sendingMap: treeSendingMap,
    createWorkspace,
    createDoc,
    createFolder,
    toggleDocBookmark,
    toggleFolderBookmark,
    updateDoc,
    updateFolder,
    createDashboard,
    deleteDashboard,
  } = useCloudApi()

  const {
    deleteWorkspace,
    deleteFolder,
    deleteDoc,
    openRenameFolderForm,
    openRenameDocForm,
    openWorkspaceEditForm,
    openWorkspaceCreateForm,
    openRenameDashboardForm,
  } = useCloudResourceModals()

  const getFoldEvents = useCallback(
    (type: CollapsableType, key: string, reversed?: boolean) => {
      if (reversed) {
        return {
          fold: () => unfoldItem(type, key),
          unfold: () => foldItem(type, key),
          toggle: () => toggleItem(type, key),
        }
      }

      return {
        fold: () => foldItem(type, key),
        unfold: () => unfoldItem(type, key),
        toggle: () => toggleItem(type, key),
      }
    },
    [toggleItem, unfoldItem, foldItem]
  )

  const sidebarHeaderControls: SidebarControls = useMemo(() => {
    const viewControls: SidebarControl[] = [
      {
        type: 'check',
        label: translate(lngKeys.GeneralBookmarks),
        checked: !sideBarOpenedLinksIdsSet.has('hide-bookmarks'),
        onClick: () => toggleItem('links', 'hide-bookmarks'),
      },
      {
        type: 'check',
        label: translate(lngKeys.GeneralDashboards),
        checked: !sideBarOpenedLinksIdsSet.has('hide-dashboards'),
        onClick: () => toggleItem('links', 'hide-dashboards'),
      },
      {
        type: 'check',
        label: translate(lngKeys.GeneralFolders),
        checked: !sideBarOpenedLinksIdsSet.has('hide-folders'),
        onClick: () => toggleItem('links', 'hide-folders'),
      },
      {
        type: 'check',
        label: translate(lngKeys.GeneralLabels),
        checked: !sideBarOpenedLinksIdsSet.has('hide-labels'),
        onClick: () => toggleItem('links', 'hide-labels'),
      },
      {
        type: 'check',
        label: translate(lngKeys.GeneralPrivate),
        checked: !sideBarOpenedLinksIdsSet.has('hide-private'),
        onClick: () => toggleItem('links', 'hide-private'),
      },
    ]

    if (
      betaRegistrationState.state === 'loaded' &&
      betaRegistrationState.betaRegistration != null
    ) {
      viewControls.push({
        type: 'check',
        label: 'Beta',
        checked: !sideBarOpenedLinksIdsSet.has('hide-beta'),
        onClick: () => toggleItem('links', 'hide-beta'),
      })
    }

    return {
      [translate(lngKeys.SidebarViewOptions)]: viewControls,
      [translate(lngKeys.GeneralOrdering)]: Object.values(
        SidebarTreeSortingOrders
      ).map((sort) => {
        return {
          type: 'radio',
          label: translate(`sort.${sort.value}`),
          checked: sort.value === preferences.sidebarTreeSortingOrder,
          onClick: () =>
            setPreferences({
              sidebarTreeSortingOrder: sort.value,
            }),
        }
      }),
    }
  }, [
    preferences,
    setPreferences,
    translate,
    toggleItem,
    sideBarOpenedLinksIdsSet,
    betaRegistrationState,
  ])

  const tree = useMemo(() => {
    if (!initialLoadDone || team == null) {
      return undefined
    }

    const currentPathWithDomain = `${process.env.BOOST_HUB_BASE_URL}${pathname}`
    const items = new Map<string, CloudTreeItem>()
    const sortingOrder = preferences.sidebarTreeSortingOrder

    const [docs, folders, workspaces] = [
      getMapValues(docsMap),
      getMapValues(foldersMap),
      getMapValues(workspacesMap),
    ]

    let personalWorkspace: SerializedWorkspace | undefined
    workspaces.forEach((wp) => {
      if (wp.personal) {
        personalWorkspace = wp
        return
      }

      const href = `${process.env.BOOST_HUB_BASE_URL}${getWorkspaceHref(
        wp,
        team,
        'index'
      )}`

      const coreRestrictedFeatures: Partial<CloudTreeItem> =
        currentUserIsCoreMember
          ? {
              dropIn: true,
              onDrop: (event: any) =>
                dropInWorkspace(event, wp.id, updateFolder, updateDoc),
              controls: [
                {
                  icon: mdiTextBoxPlus,
                  onClick: undefined,
                  placeholder: translate(lngKeys.DocTitlePlaceholder),
                  create: (title: string) =>
                    createDoc(team, {
                      workspaceId: wp.id,
                      title,
                    }),
                },
                {
                  icon: mdiFolderPlusOutline,
                  onClick: undefined,
                  placeholder: translate(lngKeys.FolderNamePlaceholder),
                  create: (folderName: string) =>
                    createFolder(team, {
                      workspaceId: wp.id,
                      description: '',
                      folderName,
                    }),
                },
              ],
              contextControls: wp.default
                ? [
                    {
                      type: MenuTypes.Normal,
                      icon: mdiCog,
                      label: translate(lngKeys.GeneralEditVerb),
                      onClick: () => openWorkspaceEditForm(wp),
                    },
                  ]
                : [
                    {
                      type: MenuTypes.Normal,
                      icon: mdiCog,
                      label: translate(lngKeys.GeneralEditVerb),
                      onClick: () => openWorkspaceEditForm(wp),
                    },
                    {
                      type: MenuTypes.Normal,
                      icon: mdiTrashCanOutline,
                      label: translate(lngKeys.GeneralDelete),
                      onClick: () => deleteWorkspace(wp),
                    },
                  ],
            }
          : {}

      items.set(wp.id, {
        id: wp.id,
        lastUpdated: wp.updatedAt,
        label: wp.name,
        defaultIcon: !wp.public ? mdiLock : undefined,
        children: wp.positions?.orderedIds || [],
        folded: !sideBarOpenedWorkspaceIdsSet.has(wp.id),
        folding: getFoldEvents('workspaces', wp.id),
        href,
        active: !showSearchScreen && href === currentPathWithDomain,
        navigateTo: () => push(href),
        ...coreRestrictedFeatures,
      })
    })

    folders.forEach((folder) => {
      const folderId = getFolderId(folder)
      const href = `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
        folder,
        team,
        'index'
      )}`

      const coreRestrictedFeatures: Partial<CloudTreeItem> =
        currentUserIsCoreMember
          ? {
              onDrop: (event: any, position: SidebarDragState) =>
                dropInDocOrFolder(
                  event,
                  {
                    type: 'folder',
                    resource: folderToDataTransferItem(folder),
                  },
                  position
                ),
              onDragStart: (event: any) => {
                saveFolderTransferData(event, folder)
              },
              onDragEnd: (event: any) => {
                clearDragTransferData(event)
              },
              dropIn: true,
              dropAround: sortingOrder === 'drag' ? true : false,
              controls: [
                {
                  icon: mdiTextBoxPlus,
                  onClick: undefined,
                  placeholder: translate(lngKeys.DocTitlePlaceholder),
                  create: (title: string) =>
                    createDoc(team, {
                      parentFolderId: folder.id,
                      workspaceId: folder.workspaceId,
                      title,
                    }),
                },
                {
                  icon: mdiFolderPlusOutline,
                  onClick: undefined,
                  placeholder: translate(lngKeys.FolderNamePlaceholder),
                  create: (folderName: string) =>
                    createFolder(team, {
                      parentFolderId: folder.id,
                      workspaceId: folder.workspaceId,
                      description: '',
                      folderName,
                    }),
                },
              ],
              contextControls: [
                {
                  type: MenuTypes.Normal,
                  icon: folder.bookmarked ? mdiStar : mdiStarOutline,
                  label:
                    treeSendingMap.get(folder.id) === 'bookmark'
                      ? '...'
                      : folder.bookmarked
                      ? translate(lngKeys.GeneralUnbookmarkVerb)
                      : translate(lngKeys.GeneralBookmarkVerb),
                  onClick: () =>
                    toggleFolderBookmark(
                      folder.teamId,
                      folder.id,
                      folder.bookmarked
                    ),
                },
                {
                  type: MenuTypes.Normal,
                  icon: mdiPencil,
                  label: translate(lngKeys.GeneralRenameVerb),
                  onClick: () => openRenameFolderForm(folder),
                },
                {
                  type: MenuTypes.Normal,
                  icon: mdiTrashCanOutline,
                  label: translate(lngKeys.GeneralDelete),
                  onClick: () => deleteFolder(folder),
                },
              ],
            }
          : {
              controls: [
                {
                  icon: folder.bookmarked ? mdiStar : mdiStarOutline,
                  onClick: () =>
                    toggleFolderBookmark(
                      folder.teamId,
                      folder.id,
                      folder.bookmarked
                    ),
                },
              ],
            }

      items.set(folderId, {
        id: folderId,
        lastUpdated: folder.updatedAt,
        label: folder.name,
        bookmarked: folder.bookmarked,
        emoji: folder.emoji,
        folded: !sideBarOpenedFolderIdsSet.has(folder.id),
        folding: getFoldEvents('folders', folder.id),
        href,
        active: !showSearchScreen && href === currentPathWithDomain,
        navigateTo: (event?: any) => {
          if (event && event.shiftKey && usingElectron) {
            sendToElectron('new-window', href)
            return
          }
          push(href)
        },
        ...coreRestrictedFeatures,
        parentId:
          folder.parentFolderId == null
            ? folder.workspaceId
            : folder.parentFolderId,
        children:
          typeof folder.positions != null &&
          typeof folder.positions !== 'string'
            ? folder.positions.orderedIds
            : [],
      })
    })

    docs.forEach((doc) => {
      const docId = getDocId(doc)
      const href = `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
        doc,
        team,
        'index'
      )}`

      const coreRestrictedFeatures: Partial<CloudTreeItem> =
        currentUserIsCoreMember
          ? {
              dropAround: sortingOrder === 'drag' ? true : false,
              onDrop: (event: any, position: SidebarDragState) =>
                dropInDocOrFolder(
                  event,
                  { type: 'doc', resource: docToDataTransferItem(doc) },
                  position
                ),
              onDragStart: (event: any) => {
                saveDocTransferData(event, doc)
              },
              onDragEnd: (event: any) => {
                clearDragTransferData(event)
              },
              contextControls: [
                {
                  type: MenuTypes.Normal,
                  icon: doc.bookmarked ? mdiStar : mdiStarOutline,
                  label:
                    treeSendingMap.get(doc.id) === 'bookmark'
                      ? '...'
                      : doc.bookmarked
                      ? translate(lngKeys.GeneralUnbookmarkVerb)
                      : translate(lngKeys.GeneralBookmarkVerb),
                  onClick: () =>
                    toggleDocBookmark(doc.teamId, doc.id, doc.bookmarked),
                },
                {
                  type: MenuTypes.Normal,
                  icon: mdiPencil,
                  label: translate(lngKeys.GeneralRenameVerb),
                  onClick: () => openRenameDocForm(doc),
                },
                {
                  type: MenuTypes.Normal,
                  icon: mdiTrashCanOutline,
                  label: translate(lngKeys.GeneralDelete),
                  onClick: () => deleteDoc(doc),
                },
              ],
            }
          : {
              controls: [
                {
                  icon: doc.bookmarked ? mdiStar : mdiStarOutline,
                  onClick: () =>
                    toggleDocBookmark(doc.teamId, doc.id, doc.bookmarked),
                },
              ],
            }

      items.set(docId, {
        id: docId,
        lastUpdated: doc.head != null ? doc.head.created : doc.updatedAt,
        label: getDocTitle(doc, 'Untitled'),
        navigateTo: (event?: any) => {
          if (event && event.shiftKey && usingElectron) {
            sendToElectron('new-window', href)
            return
          }
          push(href)
        },
        bookmarked: doc.bookmarked,
        emoji: doc.emoji,
        defaultIcon: mdiFileDocumentOutline,
        status:
          doc.props != null &&
          doc.props.status != null &&
          isString(doc.props.status.data)
            ? (doc.props.status.data as DocStatus)
            : undefined,
        hidden:
          doc.archivedAt != null ||
          (doc.props != null &&
            doc.props.status != null &&
            isString(doc.props.status.data) &&
            (doc.props.status.data === 'archived' ||
              doc.props.status.data === 'completed')),
        children: [],
        href,
        active: !showSearchScreen && href === currentPathWithDomain,
        ...coreRestrictedFeatures,
        parentId:
          doc.parentFolderId == null ? doc.workspaceId : doc.parentFolderId,
      })
    })

    const arrayItems = getMapValues(items)
    const tree: Partial<SidebarNavCategory>[] = []

    let orderedBookmarked = []
    const bookmarked = arrayItems.reduce((acc, val) => {
      if (!val.bookmarked) {
        return acc
      }

      acc.push({
        id: val.id,
        depth: 0,
        label: val.label,
        emoji: val.emoji,
        defaultIcon: val.defaultIcon,
        href: val.href,
        navigateTo: val.navigateTo,
        contextControls: val.contextControls,
        lastUpdated: val.lastUpdated,
      })

      return acc
    }, [] as (SidebarTreeChildRow & { lastUpdated: string })[])

    switch (preferences.sidebarTreeSortingOrder) {
      case 'a-z':
        orderedBookmarked = sortByAttributeAsc('label', bookmarked)
        break
      case 'z-a':
        orderedBookmarked = sortByAttributeDesc('label', bookmarked)
        break
      case 'last-updated':
        orderedBookmarked = sortByAttributeDesc('lastUpdated', bookmarked)
        break
      case 'drag':
      default:
        orderedBookmarked = bookmarked
        break
    }

    const navTree = arrayItems
      .filter((item) => item.parentId == null)
      .reduce((acc, val) => {
        acc.push({
          ...val,
          depth: 0,
          rows: buildChildrenNavRows(sortingOrder, val.children, 1, items),
        })
        return acc
      }, [] as SidebarTreeChildRow[])

    const docsPerTagIdMap = [...docsMap.values()].reduce((acc, doc) => {
      const docTags = doc.tags || []
      docTags.forEach((tag) => {
        let docIds = acc.get(tag.id)
        if (docIds == null) {
          docIds = []
          acc.set(tag.id, docIds)
        }
        docIds.push(doc.id)
      })
      return acc
    }, new Map<string, string[]>())

    const labels = getMapValues(tagsMap)
      .filter((tag) => (docsPerTagIdMap.get(tag.id) || []).length > 0)
      .sort((a, b) => {
        if (a.text < b.text) {
          return -1
        } else {
          return 1
        }
      })
      .reduce((acc, val) => {
        const href = `${process.env.BOOST_HUB_BASE_URL}${getTagHref(
          val,
          team,
          'index'
        )}`
        acc.push({
          id: val.id,
          depth: 0,
          label: val.text,
          defaultIcon: mdiTag,
          href,
          active: !showSearchScreen && href === currentPathWithDomain,
          navigateTo: (event?: any) => {
            if (event && event.shiftKey && usingElectron) {
              sendToElectron('new-window', href)
              return
            }
            push(href)
          },
        })
        return acc
      }, [] as SidebarTreeChildRow[])

    if (orderedBookmarked.length > 0) {
      tree.push({
        label: 'Bookmarks',
        title: translate(lngKeys.GeneralBookmarks),
        rows: orderedBookmarked,
      })
    }

    tree.push({
      label: 'Dashboards',
      title: translate(lngKeys.GeneralDashboards),
      rows: sortByAttributeAsc('name', getMapValues(dashboardsMap)).reduce(
        (acc, val) => {
          const href = `${process.env.BOOST_HUB_BASE_URL}${getDashboardHref(
            val,
            team,
            'index'
          )}`
          acc.push({
            id: val.id,
            depth: 0,
            label: val.name,
            defaultIcon: mdiViewDashboard,
            href,
            active: !showSearchScreen && href === currentPathWithDomain,
            navigateTo: (event?: any) => {
              if (event && event.shiftKey && usingElectron) {
                sendToElectron('new-window', href)
                return
              }
              push(href)
            },
            contextControls: [
              {
                type: MenuTypes.Normal,
                icon: mdiPencil,
                label: translate(lngKeys.GeneralRenameVerb),
                onClick: () => openRenameDashboardForm(val),
              },
              {
                type: MenuTypes.Normal,
                icon: mdiTrashCanOutline,
                label: translate(lngKeys.GeneralDelete),
                onClick: () => deleteDashboard(val),
              },
            ],
          })
          return acc
        },
        [] as SidebarTreeChildRow[]
      ),
      controls: currentUserIsCoreMember
        ? subscription == null && dashboardsMap.size !== 0
          ? [
              {
                icon: mdiPlus,
                onClick: () =>
                  openModal(<UnlockDashboardModal />, {
                    showCloseIcon: false,
                    width: 'small',
                  }),
              },
            ]
          : [
              {
                icon: mdiPlus,
                onClick: undefined,
                placeholder: translate(lngKeys.GeneralName),
                create: (name: string) =>
                  createDashboard(team, {
                    teamId: team.id,
                    name,
                  }),
              },
            ]
        : undefined,
    })

    tree.push({
      label: 'Folders',
      title: translate(lngKeys.GeneralFolders),
      rows: navTree,
      controls: currentUserIsCoreMember
        ? [
            {
              icon: mdiPlus,
              onClick: openWorkspaceCreateForm,
            },
          ]
        : undefined,
    })

    if (currentUserIsCoreMember) {
      tree.push({
        label: 'Private',
        title: translate(lngKeys.GeneralPrivate),
        rows:
          personalWorkspace != null
            ? arrayItems
                .filter((item) => item.parentId === personalWorkspace!.id)
                .reduce((acc, val) => {
                  acc.push({
                    ...val,
                    depth: 0,
                    rows: buildChildrenNavRows(
                      sortingOrder,
                      val.children,
                      1,
                      items
                    ),
                  })
                  return acc
                }, [] as SidebarTreeChildRow[])
            : [],
        controls: [
          {
            icon: mdiTextBoxPlus,
            onClick: undefined,
            placeholder: translate(lngKeys.DocTitlePlaceholder),
            create: async (title: string) => {
              if (personalWorkspace == null) {
                return createWorkspace(
                  team,
                  {
                    personal: true,
                    name: 'Private',
                    permissions: [],
                    public: false,
                  },
                  {
                    skipRedirect: true,
                    afterSuccess: (wp) =>
                      createDoc(team, {
                        workspaceId: wp.id,
                        title,
                      }),
                  }
                )
              }

              return createDoc(team, {
                workspaceId: personalWorkspace!.id,
                title,
              })
            },
          },
          {
            icon: mdiFolderPlusOutline,
            onClick: undefined,
            placeholder: translate(lngKeys.FolderNamePlaceholder),
            create: async (folderName: string) => {
              if (personalWorkspace == null) {
                return createWorkspace(
                  team,
                  {
                    personal: true,
                    name: 'Private',
                    permissions: [],
                    public: false,
                  },
                  {
                    skipRedirect: true,
                    afterSuccess: (wp) =>
                      createFolder(team, {
                        workspaceId: wp.id,
                        description: '',
                        folderName,
                      }),
                  }
                )
              }

              return createFolder(team, {
                workspaceId: personalWorkspace!.id,
                description: '',
                folderName,
              })
            },
          },
        ],
      })
    }

    if (labels.length > 0) {
      tree.push({
        label: 'Labels',
        title: translate(lngKeys.GeneralLabels),
        rows: labels,
        controls: currentUserIsCoreMember
          ? [
              {
                icon: mdiCog,
                onClick: () => {
                  openModal(<LabelsManagementModal />)
                },
                tooltip: 'Manage your labels',
              },
            ]
          : undefined,
      })
    }

    if (
      betaRegistrationState.state === 'loaded' &&
      betaRegistrationState.betaRegistration != null
    ) {
      const betaTree: SidebarTreeChildRow[] = []
      if (betaRegistrationState.betaRegistration.state.automations) {
        const href = `${getTeamLinkHref(team, 'automations')}`
        betaTree.push({
          id: 'beta-automations',
          label: 'Automations',
          depth: 0,
          href,
          active: !showSearchScreen && href === currentPathWithDomain,
          navigateTo: (event?: any) => {
            if (event && event.shiftKey && usingElectron) {
              sendToElectron('new-window', href)
              return
            }
            push(href)
          },
        })
      }

      tree.push({
        label: 'Beta',
        title: 'Beta',
        rows: betaTree,
      })
    }

    tree.forEach((category) => {
      const key = (category.label || '').toLocaleLowerCase()
      const foldKey = `fold-${key}`
      const hideKey = `hide-${key}`
      category.folded = sideBarOpenedLinksIdsSet.has(foldKey)
      category.folding = getFoldEvents('links', foldKey, true)
      category.hidden = sideBarOpenedLinksIdsSet.has(hideKey)
      category.toggleHidden = () => toggleItem('links', hideKey)
    })

    return tree as SidebarNavCategory[]
  }, [
    initialLoadDone,
    createDashboard,
    dashboardsMap,
    team,
    pathname,
    preferences.sidebarTreeSortingOrder,
    docsMap,
    foldersMap,
    workspacesMap,
    tagsMap,
    translate,
    currentUserIsCoreMember,
    openWorkspaceCreateForm,
    sideBarOpenedWorkspaceIdsSet,
    getFoldEvents,
    showSearchScreen,
    dropInWorkspace,
    updateFolder,
    updateDoc,
    createDoc,
    createFolder,
    openWorkspaceEditForm,
    deleteWorkspace,
    push,
    subscription,
    treeSendingMap,
    sideBarOpenedFolderIdsSet,
    dropInDocOrFolder,
    saveFolderTransferData,
    clearDragTransferData,
    toggleFolderBookmark,
    openRenameFolderForm,
    deleteFolder,
    saveDocTransferData,
    toggleDocBookmark,
    openRenameDocForm,
    deleteDoc,
    usingElectron,
    sendToElectron,
    openModal,
    createWorkspace,
    sideBarOpenedLinksIdsSet,
    toggleItem,
    openRenameDashboardForm,
    deleteDashboard,
    betaRegistrationState,
  ])

  const treeWithOrderedCategories = useMemo(() => {
    if (tree == null) {
      return undefined
    }

    const orderedCategories = Array.from(
      new Set([
        ...preferences.sidebarOrderedCategories.split(
          cloudSidebarOrderedCategoriesDelimiter
        ),
        ...cloudSidebaCategoryLabels,
      ])
    ).filter((item) =>
      cloudSidebaCategoryLabels.find((categoryLabel) => categoryLabel === item)
    )

    const orderedTree = tree.sort((categoryA, categoryB) => {
      if (
        orderedCategories.indexOf(categoryA.label) >
        orderedCategories.indexOf(categoryB.label)
      ) {
        return 1
      } else {
        return -1
      }
    })

    orderedTree.forEach((category) => {
      category.drag = {
        onDragStart: (event: any) => {
          event.dataTransfer.setData(
            category.label,
            CATEGORY_DRAG_TRANSFER_DATA_JSON
          )
        },
        onDragEnd: (event: any) => {
          clearDragTransferData(event)
        },
        onDrop: (event: any) => {
          const draggedCategory = event.dataTransfer.getData(
            CATEGORY_DRAG_TRANSFER_DATA_JSON
          )
          if (draggedCategory.length === 0) {
            return
          }

          const orderedItems = orderedCategories.splice(0)
          const categoryIndex = orderedItems.includes(category.label)
            ? orderedItems.indexOf(category.label)
            : orderedItems.length - 1

          const reArrangedArray = orderedItems.reduce((acc, val, i) => {
            if (i === categoryIndex) {
              acc.push(draggedCategory.current!)
            }

            if (i !== categoryIndex && val === draggedCategory.current) {
              return acc
            }

            acc.push(val)
            return acc
          }, [] as string[])

          setPreferences({
            sidebarOrderedCategories: reArrangedArray.join(
              cloudSidebarOrderedCategoriesDelimiter
            ),
          })

          draggedCategory.current = undefined
        },
      }
    })

    return orderedTree
  }, [
    tree,
    preferences.sidebarOrderedCategories,
    setPreferences,
    clearDragTransferData,
  ])

  return {
    tree,
    treeWithOrderedCategories,
    sidebarHeaderControls,
  }
}

function buildChildrenNavRows(
  sortingOrder: SidebarTreeSortingOrder,
  childrenIds: string[],
  depth: number,
  map: Map<string, CloudTreeItem>
) {
  const rows = childrenIds.reduce((acc, childId) => {
    const childRow = map.get(childId)
    if (childRow == null) {
      return acc
    }

    if (childRow.status === 'archived' || childRow.status === 'completed') {
      return acc
    }

    acc.push({
      ...childRow,
      depth,
      rows: buildChildrenNavRows(
        sortingOrder,
        childRow.children,
        depth + 1,
        map
      ),
    })

    return acc
  }, [] as (SidebarTreeChildRow & { lastUpdated: string })[])

  switch (sortingOrder) {
    case 'a-z':
      return sortByAttributeAsc('label', rows)
    case 'z-a':
      return sortByAttributeDesc('label', rows)
    case 'last-updated':
      return sortByAttributeDesc('lastUpdated', rows)
    case 'drag':
    default:
      return rows
  }
}

type CloudTreeItem = {
  id: string
  parentId?: string
  label: string
  defaultIcon?: string
  emoji?: string
  hidden?: boolean
  bookmarked?: boolean
  status?: DocStatus
  children: string[]
  folding?: FoldingProps
  folded?: boolean
  href?: string
  active?: boolean
  lastUpdated: string
  navigateTo?: () => void
  controls?: SidebarNavControls[]
  contextControls?: MenuItem[]
  dropIn?: boolean
  dropAround?: boolean
  onDragStart?: (event: any) => void
  onDrop?: (event: any, position?: SidebarDragState) => void
  onDragEnd?: (event: any) => void
}
