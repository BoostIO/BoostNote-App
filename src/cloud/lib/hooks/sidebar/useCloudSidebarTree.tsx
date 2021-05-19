import React, { useCallback, useMemo } from 'react'
import {
  mdiApplicationCog,
  mdiArchiveOutline,
  mdiFileDocumentOutline,
  mdiFilePlusOutline,
  mdiFolderPlusOutline,
  mdiLock,
  mdiPaperclip,
  mdiPencil,
  mdiPlus,
  mdiStar,
  mdiStarOutline,
  mdiTag,
  mdiTrashCanOutline,
  mdiWeb,
} from '@mdi/js'
import { FoldingProps } from '../../../../shared/components/atoms/FoldingWrapper'
import {
  SidebarNavCategory,
  SidebarNavControls,
  SidebarTreeChildRow,
} from '../../../../shared/components/organisms/Sidebar/molecules/SidebarTree'
import { SidebarDragState } from '../../../../shared/lib/dnd'
import { SidebarTreeSortingOrder } from '../../../../shared/lib/sidebar'
import { MenuItem, MenuTypes } from '../../../../shared/lib/stores/contextMenu'
import { useModal } from '../../../../shared/lib/stores/modal'
import {
  getMapValues,
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../../shared/lib/utils/array'
import { getDocLinkHref } from '../../../components/atoms/Link/DocLink'
import { getFolderHref } from '../../../components/atoms/Link/FolderLink'
import { getTagHref } from '../../../components/atoms/Link/TagLink'
import { getTeamLinkHref } from '../../../components/atoms/Link/TeamLink'
import { getWorkspaceHref } from '../../../components/atoms/Link/WorkspaceLink'
import CreateWorkspaceModal from '../../../components/organisms/Modal/contents/Workspace/CreateWorkspaceModal'
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
import { getDocId, getDocTitle, getFolderId } from '../../utils/patterns'
import { useCloudApi } from '../useCloudApi'
import { useCloudResourceModals } from '../useCloudResourceModals'
import { useCloudSidebarDnd } from './useCloudSidebarDnd'

export function useCloudSidebarTree() {
  const { team } = usePage()
  const { push, pathname } = useRouter()
  const { openModal } = useModal()
  const { preferences, setPreferences } = usePreferences()

  const {
    initialLoadDone,
    tagsMap,
    docsMap,
    foldersMap,
    workspacesMap,
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
    draggedCategory,
    draggedResource,
    dropInDocOrFolder,
    dropInWorkspace,
  } = useCloudSidebarDnd()

  const {
    sendingMap: treeSendingMap,
    createWorkspace,
    createDoc,
    createFolder,
    toggleDocArchive,
    toggleDocBookmark,
    toggleFolderBookmark,
    updateDoc,
    updateFolder,
  } = useCloudApi()

  const {
    deleteWorkspace,
    deleteFolder,
    openRenameFolderForm,
    openRenameDocForm,
    openWorkspaceEditForm,
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

  const tree = useMemo(() => {
    if (!initialLoadDone || team == null) {
      return undefined
    }

    const currentPathWithDomain = `${process.env.BOOST_HUB_BASE_URL}${pathname}`
    const items = new Map<string, CloudTreeItem>()

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
      items.set(wp.id, {
        id: wp.id,
        lastUpdated: wp.updatedAt,
        label: wp.name,
        defaultIcon: !wp.public ? mdiLock : undefined,
        children: wp.positions?.orderedIds || [],
        folded: !sideBarOpenedWorkspaceIdsSet.has(wp.id),
        folding: getFoldEvents('workspaces', wp.id),
        href,
        active: href === currentPathWithDomain,
        navigateTo: () => push(href),
        dropIn: true,
        onDrop: () => dropInWorkspace(wp.id, updateFolder, updateDoc),
        controls: [
          {
            icon: mdiFilePlusOutline,
            onClick: undefined,
            placeholder: 'Doc title..',
            create: (title: string) =>
              createDoc(team, {
                workspaceId: wp.id,
                title,
              }),
          },
          {
            icon: mdiFolderPlusOutline,
            onClick: undefined,
            placeholder: 'Folder name..',
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
                label: 'Edit',
                onClick: () => openWorkspaceEditForm(wp),
              },
            ]
          : [
              {
                type: MenuTypes.Normal,
                icon: mdiApplicationCog,
                label: 'Edit',
                onClick: () => openWorkspaceEditForm(wp),
              },
              {
                type: MenuTypes.Normal,
                icon: mdiTrashCanOutline,
                label: 'Delete',
                onClick: () => deleteWorkspace(wp),
              },
            ],
      })
    })

    folders.forEach((folder) => {
      const folderId = getFolderId(folder)
      const href = `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
        folder,
        team,
        'index'
      )}`
      items.set(folderId, {
        id: folderId,
        lastUpdated: folder.updatedAt,
        label: folder.name,
        bookmarked: folder.bookmarked,
        emoji: folder.emoji,
        folded: !sideBarOpenedFolderIdsSet.has(folder.id),
        folding: getFoldEvents('folders', folder.id),
        href,
        active: href === currentPathWithDomain,
        navigateTo: () => push(href),
        onDrop: (position: SidebarDragState) =>
          dropInDocOrFolder({ type: 'folder', result: folder }, position),
        onDragStart: () => {
          draggedResource.current = { type: 'folder', result: folder }
        },
        onDragEnd: () => {
          draggedResource.current = undefined
        },
        dropIn: true,
        dropAround:
          preferences.sidebarTreeSortingOrder === 'drag' ? true : false,
        controls: [
          {
            icon: mdiFilePlusOutline,
            onClick: undefined,
            placeholder: 'Doc title..',
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
            placeholder: 'Folder name..',
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
                ? 'Bookmarked'
                : 'Bookmark',
            onClick: () =>
              toggleFolderBookmark(folder.teamId, folder.id, folder.bookmarked),
          },
          {
            type: MenuTypes.Normal,
            icon: mdiPencil,
            label: 'Rename',
            onClick: () => openRenameFolderForm(folder),
          },
          {
            type: MenuTypes.Normal,
            icon: mdiTrashCanOutline,
            label: 'Delete',
            onClick: () => deleteFolder(folder),
          },
        ],
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
      items.set(docId, {
        id: docId,
        lastUpdated: doc.head != null ? doc.head.created : doc.updatedAt,
        label: getDocTitle(doc, 'Untitled'),
        bookmarked: doc.bookmarked,
        emoji: doc.emoji,
        defaultIcon: mdiFileDocumentOutline,
        archived: doc.archivedAt != null,
        children: [],
        href,
        active: href === currentPathWithDomain,
        dropAround:
          preferences.sidebarTreeSortingOrder === 'drag' ? true : false,
        navigateTo: () => push(href),
        onDrop: (position: SidebarDragState) =>
          dropInDocOrFolder({ type: 'doc', result: doc }, position),
        onDragStart: () => {
          draggedResource.current = { type: 'doc', result: doc }
        },
        onDragEnd: () => {
          draggedResource.current = undefined
        },
        contextControls: [
          {
            type: MenuTypes.Normal,
            icon: doc.bookmarked ? mdiStar : mdiStarOutline,
            label:
              treeSendingMap.get(doc.id) === 'bookmark'
                ? '...'
                : doc.bookmarked
                ? 'Bookmarked'
                : 'Bookmark',
            onClick: () =>
              toggleDocBookmark(doc.teamId, doc.id, doc.bookmarked),
          },
          {
            type: MenuTypes.Normal,
            icon: mdiPencil,
            label: 'Rename',
            onClick: () => openRenameDocForm(doc),
          },
          {
            type: MenuTypes.Normal,
            icon: mdiArchiveOutline,
            label: doc.archivedAt == null ? 'Archive' : 'Restore',
            onClick: () => toggleDocArchive(doc.teamId, doc.id, doc.archivedAt),
          },
        ],
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
          rows: buildChildrenNavRows(
            preferences.sidebarTreeSortingOrder,
            val.children,
            1,
            items
          ),
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
          active: href === currentPathWithDomain,
          navigateTo: () => push(href),
        })
        return acc
      }, [] as SidebarTreeChildRow[])

    if (orderedBookmarked.length > 0) {
      tree.push({
        label: 'Bookmarks',
        rows: orderedBookmarked,
      })
    }
    tree.push({
      label: 'Workspaces',
      rows: navTree,
      controls: [
        {
          icon: mdiPlus,
          onClick: () => openModal(<CreateWorkspaceModal />),
        },
      ],
    })

    if (!team.personal) {
      tree.push({
        label: 'Private',
        rows:
          personalWorkspace != null
            ? arrayItems
                .filter((item) => item.parentId === personalWorkspace!.id)
                .reduce((acc, val) => {
                  acc.push({
                    ...val,
                    depth: 0,
                    rows: buildChildrenNavRows(
                      preferences.sidebarTreeSortingOrder,
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
            icon: mdiFilePlusOutline,
            onClick: undefined,
            placeholder: 'Doc title..',
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
            placeholder: 'Folder name..',
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
        rows: labels,
      })
    }

    tree.push({
      label: 'More',
      rows: [
        {
          id: 'sidenav-attachment',
          label: 'Attachments',
          defaultIcon: mdiPaperclip,
          href: getTeamLinkHref(team, 'uploads'),
          active: getTeamLinkHref(team, 'uploads') === pathname,
          navigateTo: () => push(getTeamLinkHref(team, 'uploads')),
          depth: 0,
        },
        {
          id: 'sidenav-shared',
          label: 'Shared',
          defaultIcon: mdiWeb,
          href: getTeamLinkHref(team, 'shared'),
          active: getTeamLinkHref(team, 'shared') === pathname,
          navigateTo: () => push(getTeamLinkHref(team, 'shared')),
          depth: 0,
        },
        {
          id: 'sidenav-archived',
          label: 'Archived',
          defaultIcon: mdiArchiveOutline,
          href: getTeamLinkHref(team, 'archived'),
          active: getTeamLinkHref(team, 'archived') === pathname,
          navigateTo: () => push(getTeamLinkHref(team, 'archived')),
          depth: 0,
        },
      ],
    })

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
    preferences.sidebarTreeSortingOrder,
    pathname,
    docsMap,
    foldersMap,
    workspacesMap,
    tagsMap,
    treeSendingMap,
    sideBarOpenedFolderIdsSet,
    sideBarOpenedLinksIdsSet,
    sideBarOpenedWorkspaceIdsSet,
    toggleItem,
    getFoldEvents,
    push,
    openModal,
    toggleDocBookmark,
    toggleFolderBookmark,
    createWorkspace,
    deleteWorkspace,
    toggleDocArchive,
    deleteFolder,
    createFolder,
    createDoc,
    dropInDocOrFolder,
    dropInWorkspace,
    updateFolder,
    updateDoc,
    openRenameFolderForm,
    openRenameDocForm,
    openWorkspaceEditForm,
    draggedResource,
    team,
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
        onDragStart: () => {
          draggedCategory.current = category.label
        },
        onDragEnd: () => {
          draggedCategory.current = undefined
        },
        onDrop: () => {
          if (draggedCategory.current == null) {
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
    draggedCategory,
  ])

  return {
    tree,
    treeWithOrderedCategories,
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

    if (childRow.archived) {
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
  bookmarked?: boolean
  archived?: boolean
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
  onDragStart?: () => void
  onDrop?: (position?: SidebarDragState) => void
  onDragEnd?: () => void
}
