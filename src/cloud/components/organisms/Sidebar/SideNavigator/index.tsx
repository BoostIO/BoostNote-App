import React, { useMemo } from 'react'
import { useNav } from '../../../../lib/stores/nav'
import { usePage } from '../../../../lib/stores/pageStore'
import SideNavigatorFolderItem from './SideNavigatorFolderItem'
import SideNavigatorDocItem from './SideNavigatorDocItem'
import {
  NavResource,
  OrderedNavResource,
} from '../../../../interfaces/resources'
import { SidebarDragState } from '../../../../lib/dnd'
import { getFolderId, getDocId } from '../../../../lib/utils/patterns'
import {
  getIndexMapFromArray,
  sortArrayByIntProperty,
} from '../../../../lib/utils/array'
import styled from '../../../../lib/styled'
import { sidebarText } from '../../../../lib/styled/styleFunctions'
import { SerializedWorkspace } from '../../../../interfaces/db/workspace'

interface SideNavigatorProps {
  workspace: SerializedWorkspace
  draggedResource: React.MutableRefObject<NavResource | undefined>
}

const SideNavigator = ({ workspace, draggedResource }: SideNavigatorProps) => {
  const { foldersMap, docsMap, moveResourceHandler } = useNav()
  const { team } = usePage()

  const orderingMap = useMemo(() => {
    if (workspace != null && workspace.positions != null) {
      return getIndexMapFromArray(workspace.positions.orderedIds)
    }
    return getIndexMapFromArray([])
  }, [workspace])

  const rootResources: OrderedNavResource[] = useMemo(() => {
    if (team == null || workspace == null) {
      return []
    }
    const childrenArray: OrderedNavResource[] = []
    Array.from(foldersMap.values())
      .filter(
        (folder) =>
          folder.pathname.split('/').slice(1).length === 1 &&
          team.id === folder.teamId &&
          workspace.id === folder.workspaceId
      )
      .forEach((subFolder) => {
        childrenArray.push({
          type: 'folder',
          result: subFolder,
          order: orderingMap.get(getFolderId(subFolder)),
        })
      })

    Array.from(docsMap.values())
      .filter(
        (doc) =>
          doc.folderPathname === '/' &&
          team.id === doc.teamId &&
          workspace.id === doc.workspaceId &&
          doc.archivedAt == null
      )
      .forEach((subDoc) => {
        childrenArray.push({
          type: 'doc',
          result: subDoc,
          order: orderingMap.get(getDocId(subDoc)),
        })
      })

    return sortArrayByIntProperty(childrenArray, 'order')
  }, [docsMap, foldersMap, orderingMap, team, workspace])

  const onDragStartHandler = (resource: NavResource) => {
    draggedResource.current = resource
  }

  const onDropHandler = async (
    targetedResource: NavResource,
    targetedPosition: SidebarDragState
  ) => {
    if (draggedResource.current == null) {
      return
    }

    moveResourceHandler(
      draggedResource.current,
      targetedResource,
      targetedPosition
    )
  }

  if (rootResources.length === 0) {
    return <StyledEmptyWorkspaceWarning></StyledEmptyWorkspaceWarning>
  }

  return (
    <div>
      {rootResources.map((resource) => {
        switch (resource.type) {
          case 'folder':
            return (
              <SideNavigatorFolderItem
                key={resource.result.id}
                item={resource.result}
                onDragStart={onDragStartHandler}
                onDrop={onDropHandler}
              />
            )
          default:
          case 'doc':
            return (
              <SideNavigatorDocItem
                key={resource.result.id}
                item={resource.result}
                onDragStart={onDragStartHandler}
                onDrop={onDropHandler}
              />
            )
        }
      })}
    </div>
  )
}

const StyledEmptyWorkspaceWarning = styled.div`
  ${sidebarText}
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  padding: 0 12px;
`

export default SideNavigator
