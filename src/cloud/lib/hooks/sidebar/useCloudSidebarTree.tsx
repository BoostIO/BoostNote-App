import React, { useCallback, useMemo } from 'react'
import {
  mdiApplicationCog,
  mdiFileDocumentOutline,
  mdiTextBoxPlus,
  mdiFolderCogOutline,
  mdiFolderPlusOutline,
  mdiLock,
  mdiPencil,
  mdiPlus,
  mdiStar,
  mdiStarOutline,
  mdiTag,
  mdiTrashCanOutline,
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
import { getDocStatusHref, getSmartFolderHref } from '../../href'
import CreateSmartFolderModal from '../../../components/Modal/contents/SmartFolder/CreateSmartFolderModal'
import UpdateSmartFolderModal from '../../../components/Modal/contents/SmartFolder/UpdateSmartFolderModal'
import { useDialog } from '../../../../design/lib/stores/dialog'
import { DocStatus } from '../../../interfaces/db/doc'
import { useI18n } from '../useI18n'
import { lngKeys } from '../../i18n/types'
import { SidebarControls } from '../../../../design/components/organisms/Sidebar/atoms/SidebarHeader'
import { useSearch } from '../../stores/search'
import {
  SidebarNavCategory,
  SidebarNavControls,
  SidebarTreeChildRow,
} from '../../../../design/components/organisms/Sidebar/molecules/SidebarTree'
import { CATEGORY_DRAG_TRANSFER_DATA_JSON } from '../../../interfaces/resources'

export function useCloudSidebarTree() {
  const { team, currentUserIsCoreMember } = usePage()
  const { push, pathname } = useRouter()
  const { openModal } = useModal()
  const { preferences, setPreferences } = usePreferences()
  const { messageBox } = useDialog()
  const { translate } = useI18n()
  const { showSearchScreen } = useSearch()

  const {
    initialLoadDone,
    docsMap,
    foldersMap,
    workspacesMap,
    tagsMap,
    smartFoldersMap,
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
    deleteSmartFolder,
  } = useCloudApi()

  const {
    deleteWorkspace,
    deleteFolder,
    deleteDoc,
    openRenameFolderForm,
    openRenameDocForm,
    openWorkspaceEditForm,
    openWorkspaceCreateForm,
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
    return {
      [translate(lngKeys.SidebarViewOptions)]: [
        {
          type: 'check',
          label: translate(lngKeys.GeneralBookmarks),
          checked: !sideBarOpenedLinksIdsSet.has('hide-bookmarks'),
          onClick: () => toggleItem('links', 'hide-bookmarks'),
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
        {
          type: 'check',
          label: translate(lngKeys.GeneralSmartFolders),
          checked: !sideBarOpenedLinksIdsSet.has('hide-smart folders'),
          onClick: () => toggleItem('links', 'hide-smart folders'),
        },
      ],
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
  ])

  const tree = useMemo(() => {
    if (!initialLoadDone || team == null) {
      return undefined
    }

    const currentPathWithDomain = `${process.env.BOOST_HUB_BASE_URL}${pathname}`
    const items = new Map<string, CloudTreeItem>()
    const sortingOrder = preferences.sidebarTreeSortingOrder

    const [docs, folders, workspaces, smartFolders] = [
      getMapValues(docsMap),
      getMapValues(foldersMap),
      getMapValues(workspacesMap),
      getMapValues(smartFoldersMap),
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

      const coreRestrictedFeatures: Partial<CloudTreeItem> = currentUserIsCoreMember
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
                    icon: mdiApplicationCog,
                    label: translate(lngKeys.GeneralEditVerb),
                    onClick: () => openWorkspaceEditForm(wp),
                  },
                ]
              : [
                  {
                    type: MenuTypes.Normal,
                    icon: mdiApplicationCog,
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

      const coreRestrictedFeatures: Partial<CloudTreeItem> = currentUserIsCoreMember
        ? {
            onDrop: (event: any, position: SidebarDragState) =>
              dropInDocOrFolder(
                event,
                { type: 'folder', resource: folderToDataTransferItem(folder) },
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
        navigateTo: () => push(href),
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

      const coreRestrictedFeatures: Partial<CloudTreeItem> = currentUserIsCoreMember
        ? {
            dropAround: sortingOrder === 'drag' ? true : false,
            navigateTo: () => push(href),
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
        bookmarked: doc.bookmarked,
        emoji: doc.emoji,
        defaultIcon: mdiFileDocumentOutline,
        status: doc.status,
        hidden:
          doc.archivedAt != null ||
          doc.status === 'archived' ||
          doc.status === 'completed',
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
          navigateTo: () => push(href),
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
      label: 'Smart Folders',
      title: translate(lngKeys.GeneralSmartFolders),
      rows: smartFolders.map((smartFolder) => {
        const href = `${process.env.BOOST_HUB_BASE_URL}${getSmartFolderHref(
          smartFolder,
          team,
          'index'
        )}`
        return {
          id: smartFolder.id,
          label: smartFolder.name,
          defaultIcon: mdiFolderCogOutline,
          depth: 0,
          active: !showSearchScreen && href === currentPathWithDomain,
          navigateTo: () => push(href),
          contextControls: !currentUserIsCoreMember
            ? undefined
            : [
                {
                  type: MenuTypes.Normal,
                  icon: mdiPencil,
                  label: translate(lngKeys.GeneralEditVerb),
                  onClick: () => {
                    openModal(
                      <UpdateSmartFolderModal smartFolder={smartFolder} />
                    )
                  },
                },
                {
                  type: MenuTypes.Normal,
                  icon: mdiTrashCanOutline,
                  label: translate(lngKeys.GeneralDelete),
                  onClick: () => {
                    messageBox({
                      title: `Delete ${smartFolder.name}?`,
                      message: `Are you sure to delete this smart folder?`,
                      buttons: [
                        {
                          variant: 'secondary',
                          label: translate(lngKeys.GeneralCancel),
                          cancelButton: true,
                          defaultButton: true,
                        },
                        {
                          variant: 'danger',
                          label: translate(lngKeys.GeneralDelete),
                          onClick: async () => {
                            await deleteSmartFolder(smartFolder)
                          },
                        },
                      ],
                    })
                  },
                },
              ],
        }
      }),
      controls: currentUserIsCoreMember
        ? [
            {
              icon: mdiPlus,
              onClick: () => {
                openModal(<CreateSmartFolderModal />)
              },
              tooltip: 'Add smart folder',
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
    team,
    pathname,
    preferences.sidebarTreeSortingOrder,
    docsMap,
    foldersMap,
    workspacesMap,
    smartFoldersMap,
    tagsMap,
    translate,
    currentUserIsCoreMember,
    openWorkspaceCreateForm,
    showSearchScreen,
    sideBarOpenedWorkspaceIdsSet,
    getFoldEvents,
    dropInWorkspace,
    updateFolder,
    updateDoc,
    createDoc,
    createFolder,
    openWorkspaceEditForm,
    deleteWorkspace,
    push,
    treeSendingMap,
    sideBarOpenedFolderIdsSet,
    dropInDocOrFolder,
    saveFolderTransferData,
    toggleFolderBookmark,
    openRenameFolderForm,
    deleteFolder,
    saveDocTransferData,
    toggleDocBookmark,
    openRenameDocForm,
    deleteDoc,
    openModal,
    messageBox,
    deleteSmartFolder,
    createWorkspace,
    sideBarOpenedLinksIdsSet,
    toggleItem,
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
  }, [tree, preferences.sidebarOrderedCategories, setPreferences])

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
