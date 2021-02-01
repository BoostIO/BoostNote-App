import React, { useMemo, useState, useCallback } from 'react'
import { SerializedFolderWithBookmark } from '../../../../interfaces/db/folder'
import { usePage } from '../../../../lib/stores/pageStore'
import cc from 'classcat'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
  SideNavControlStyle,
  SideNavFolderItemStyle,
} from './styled'
import { mdiFolderOutline } from '@mdi/js'
import FolderLink from '../../../atoms/Link/FolderLink'
import { useNav } from '../../../../lib/stores/nav'
import SideNavigatorPlaceholderItem from './SideNavigatorPlaceholderItem'
import SideNavigatorFolderControls from './SideNavigatorFolderControls'
import { SerializedDocWithBookmark } from '../../../../interfaces/db/doc'
import SideNavigatorDocItem from './SideNavigatorDocItem'
import {
  NavResource,
  OrderedPendingNavResource,
} from '../../../../interfaces/resources'
import { SidebarDragState, DraggedTo } from '../../../../lib/dnd'
import { SerializedFolderPositions } from '../../../../interfaces/db/folderPositions'
import { getFolderId, getDocId } from '../../../../lib/utils/patterns'
import {
  getIndexMapFromArray,
  sortArrayByIntProperty,
} from '../../../../lib/utils/array'
import { getHexFromUUID } from '../../../../lib/utils/string'
import {
  useCapturingGlobalKeyDownHandler,
  isSingleKeyEvent,
  preventKeyboardEventPropagation,
} from '../../../../lib/keyboard'
import { shortcuts } from '../../../../lib/shortcuts'
import SideNavIcon from './SideNavIcon'
import SideNavigatorFolderForm from './SideNavigatorFolderForm'
import { useSidebarCollapse } from '../../../../lib/stores/sidebarCollapse'
import SideNavigatorFoldButton from './SideNavigatorFoldButton'

interface SideNavigatorFolderItemProps {
  item: SerializedFolderWithBookmark
  onDragStart: (resource: NavResource) => void
  onDrop: (resource: NavResource, targetedPosition: SidebarDragState) => void
}

const SideNavigatorFolderItem = ({
  item,
  onDragStart,
  onDrop,
}: SideNavigatorFolderItemProps) => {
  const { pageFolder } = usePage()
  const { team } = usePage()
  const [draggedOver, setDraggedOver] = useState<SidebarDragState>()
  const dragRef = React.createRef<HTMLDivElement>()
  const [newFolderFormIsOpened, setNewFolderFormIsOpened] = useState<boolean>(
    false
  )

  const pathSplit = item.pathname.split('/').slice(1)
  const depth = pathSplit.length + 1
  const folderIsActive = pageFolder == null ? false : item.id === pageFolder.id
  const hasChildren =
    item.childFoldersIds.length + item.childDocsIds.length !== 0
  const { docsMap, foldersMap } = useNav()
  const {
    toggleItem,
    unfoldItem,
    foldItem,
    sideBarOpenedFolderIdsSet,
  } = useSidebarCollapse()
  const folded = !sideBarOpenedFolderIdsSet.has(item.id)

  const orderingMap = useMemo(() => {
    // safe-case: if positions are not populated
    if (typeof item.positions === 'string') {
      return new Map<string, number>()
    }
    return getIndexMapFromArray(
      (item.positions as SerializedFolderPositions).orderedIds
    )
  }, [item.positions])

  const childResources: OrderedPendingNavResource[] = useMemo(() => {
    const childrenArray: OrderedPendingNavResource[] = []
    item.childFoldersIds.forEach((subFolderId) => {
      if (foldersMap.has(subFolderId)) {
        const folder = foldersMap.get(
          subFolderId
        ) as SerializedFolderWithBookmark
        childrenArray.push({
          type: 'folder',
          result: folder,
          order: orderingMap.get(getFolderId(folder)),
        })
      } else {
        childrenArray.push({
          type: 'folder',
          result: subFolderId as string,
          order: undefined,
        })
      }
    })

    item.childDocsIds.forEach((subDocId) => {
      if (docsMap.has(subDocId)) {
        const doc = docsMap.get(subDocId) as SerializedDocWithBookmark
        if (doc.archivedAt != null) {
          return
        }

        childrenArray.push({
          type: 'doc',
          result: doc,
          order: orderingMap.get(getDocId(doc)),
        })
      } else {
        childrenArray.push({
          type: 'doc',
          result: subDocId as string,
          order: undefined,
        })
      }
    })

    return sortArrayByIntProperty(childrenArray, 'order')
  }, [
    docsMap,
    foldersMap,
    item.childFoldersIds,
    item.childDocsIds,
    orderingMap,
  ])

  const children = useMemo(() => {
    if (folded) {
      return
    }

    return (
      <>
        {childResources.map((resource) => {
          if (typeof resource.result === 'string') {
            return (
              <SideNavigatorPlaceholderItem
                key={resource.result}
                depth={depth + 1}
                type={resource.type}
              />
            )
          }

          switch (resource.type) {
            case 'folder':
              const folder = resource.result as SerializedFolderWithBookmark
              return (
                <SideNavigatorFolderItem
                  key={folder.id}
                  item={folder}
                  onDragStart={onDragStart}
                  onDrop={onDrop}
                />
              )
            case 'doc':
              const doc = resource.result as SerializedDocWithBookmark
              return (
                <SideNavigatorDocItem
                  key={doc.id}
                  item={doc}
                  onDragStart={onDragStart}
                  onDrop={onDrop}
                />
              )
            default:
              return null
          }
        })}
      </>
    )
  }, [folded, childResources, depth, onDragStart, onDrop])

  const onDragOverHandler: React.DragEventHandler = (event) => {
    event.preventDefault()
    const dragY = event.pageY
    const rect = dragRef.current!.getBoundingClientRect()
    const tresholdTop = rect.top + rect.height / 4

    const tresholdBottom = rect.top + (rect.height / 4) * 3

    if (dragY < tresholdTop) {
      setDraggedOver(DraggedTo.beforeItem)
    } else if (dragY > tresholdBottom) {
      setDraggedOver(DraggedTo.afterItem)
    } else {
      setDraggedOver(DraggedTo.insideFolder)
    }
  }

  const onDragLeaveHandler: React.DragEventHandler = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const relatedTarget = event.relatedTarget
    let targetIsChildElement = false
    if (
      relatedTarget != null &&
      dragRef.current != null &&
      relatedTarget != dragRef.current &&
      relatedTarget instanceof Node
    ) {
      if (dragRef.current.contains(relatedTarget)) {
        targetIsChildElement = true
      }
    }

    if (!targetIsChildElement) {
      setDraggedOver(undefined)
    }
  }

  const onDropHandler: React.DragEventHandler = (event) => {
    event.preventDefault()
    onDrop({ type: 'folder', result: item }, draggedOver)
    setDraggedOver(undefined)
  }

  const unfoldFolder = useCallback(
    (item: SerializedFolderWithBookmark) => {
      unfoldItem('folders', item.id)
    },
    [unfoldItem]
  )

  const foldFolder = useCallback(
    (item: SerializedFolderWithBookmark) => {
      foldItem('folders', item.id)
    },
    [foldItem]
  )

  const toggleFoldingFolder = useCallback(
    (item: SerializedFolderWithBookmark) => {
      toggleItem('folders', item.id)
    },
    [toggleItem]
  )

  const [focused, setFocused] = useState(false)

  const onBlurHandler = () => {
    setFocused(false)
  }

  const keyDownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!focused) {
        return
      }
      if (isSingleKeyEvent(event, shortcuts.unfoldFolder)) {
        preventKeyboardEventPropagation(event)
        unfoldFolder(item)
        return
      }
      if (isSingleKeyEvent(event, shortcuts.foldFolder)) {
        preventKeyboardEventPropagation(event)
        foldFolder(item)
        return
      }
    },
    [item, unfoldFolder, foldFolder, focused]
  )
  useCapturingGlobalKeyDownHandler(keyDownHandler)

  const onNewFolderClick = useCallback(() => {
    unfoldFolder(item)
    setNewFolderFormIsOpened(true)
  }, [unfoldFolder, item])

  return (
    <SideNavFolderItemStyle
      className={draggedOver === 0 ? 'dragged-over0' : ''}
      onBlur={onBlurHandler}
    >
      <SideNavItemStyle
        draggable={true}
        onDragStart={() => onDragStart({ type: 'folder', result: item })}
        onDragLeave={onDragLeaveHandler}
        onDragOver={onDragOverHandler}
        onDrop={onDropHandler}
        ref={dragRef}
        className={cc([
          `d-${depth} folder draggable`,
          folderIsActive && 'active',
          draggedOver != null && `dragged-over dragged-over${draggedOver}`,
          focused && 'focused',
        ])}
      >
        <div className={cc(['sideNavWrapper', !hasChildren && 'empty'])}>
          <SideNavigatorFoldButton
            hasChildren={hasChildren}
            toggle={() => toggleFoldingFolder(item)}
            folded={folded}
            depth={depth}
          />
          <SideNavClickableButtonStyle
            style={{
              paddingLeft: `${12 * (depth - 1) + 26}px`,
            }}
          >
            <SideNavIcon mdiPath={mdiFolderOutline} item={item} type='folder' />
            <FolderLink
              folder={item}
              team={team!}
              className='itemLink'
              id={`tree-fD${getHexFromUUID(item.id)}`}
              onFocus={() => setFocused(true)}
            >
              <SideNavLabelStyle>{item.name}</SideNavLabelStyle>
            </FolderLink>
          </SideNavClickableButtonStyle>
        </div>
        <SideNavControlStyle className='controls show-tooltip'>
          <SideNavigatorFolderControls
            folder={item}
            focused={focused}
            onNewFolderClick={onNewFolderClick}
          />
        </SideNavControlStyle>
      </SideNavItemStyle>
      {newFolderFormIsOpened && (
        <SideNavigatorFolderForm
          workspaceId={item.workspaceId}
          parentFolderId={item.id}
          close={() => setNewFolderFormIsOpened(false)}
          depth={depth}
        />
      )}
      {children}
    </SideNavFolderItemStyle>
  )
}

export default SideNavigatorFolderItem
