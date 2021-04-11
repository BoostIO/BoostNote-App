import React, { useState, useMemo, useCallback } from 'react'
import { SerializedWorkspace } from '../../../../interfaces/db/workspace'
import { usePage } from '../../../../lib/stores/pageStore'
import { useNav } from '../../../../lib/stores/nav'
import { SerializedTeam } from '../../../../interfaces/db/team'
import { onDragLeaveCb } from '../../../../lib/dnd'
import { NavResource } from '../../../../interfaces/resources'
import cc from 'classcat'
import { StyledSideNavigatorBackground } from './styled'
import WorkspaceLink from '../../../atoms/Link/WorkspaceLink'
import TeamLink from '../../../atoms/Link/TeamLink'
import {
  SideNavControlStyle,
  SideNavIconStyle,
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
} from '../SideNavigator/styled'
import SideNavigatorFolderForm from '../SideNavigator/SideNavigatorFolderForm'
import SideNavigator from '../SideNavigator'
import SideNavigatorWorkspaceControls from './SideNavigatorWorkspaceControls'
import { mdiFolderAccountOutline, mdiLockOutline } from '@mdi/js'
import IconMdi from '../../../atoms/IconMdi'
import { getHexFromUUID } from '../../../../lib/utils/string'
import { useSidebarCollapse } from '../../../../lib/stores/sidebarCollapse'
import {
  useCapturingGlobalKeyDownHandler,
  isSingleKeyEvent,
  preventKeyboardEventPropagation,
} from '../../../../lib/keyboard'
import { shortcuts } from '../../../../lib/shortcuts'
import SideNavigatorFoldButton from '../SideNavigator/SideNavigatorFoldButton'
import Tooltip from '../../../atoms/Tooltip'
import { useToast } from '../../../../../lib/v2/stores/toast'

interface SidebarWorkspaceItemProps {
  workspace: SerializedWorkspace
  team: SerializedTeam
  draggedResource: React.MutableRefObject<NavResource | undefined>
}

const SidebarWorkspaceItem = ({
  workspace,
  team,
  draggedResource,
}: SidebarWorkspaceItemProps) => {
  const { pageWorkspace } = usePage()
  const {
    updateFolderHandler,
    updateDocHandler,
    docsMap,
    foldersMap,
  } = useNav()
  const { pushMessage } = useToast()
  const dragRef = React.createRef<HTMLDivElement>()
  const [draggedOver, setDraggedOver] = useState<boolean>(false)
  const [newFolderFormIsOpened, setNewFolderFormIsOpened] = useState<boolean>(
    false
  )
  const [focused, setFocused] = useState(false)
  const {
    toggleItem,
    unfoldItem,
    foldItem,
    sideBarOpenedWorkspaceIdsSet,
  } = useSidebarCollapse()
  const folded = !sideBarOpenedWorkspaceIdsSet.has(workspace.id)

  const hasChildren = useMemo(() => {
    return (
      [...foldersMap.values()].filter(
        (folder) =>
          folder.workspaceId === workspace.id && folder.parentFolderId == null
      ).length +
        [...docsMap.values()].filter(
          (doc) =>
            doc.workspaceId === workspace.id && doc.parentFolderId == null
        ).length >
      0
    )
  }, [docsMap, foldersMap, workspace])

  const onBlurHandler = () => {
    setFocused(false)
  }

  const onDragOverHandler: React.DragEventHandler = (event) => {
    event.preventDefault()
    setDraggedOver(true)
  }

  const onDragLeaveHandler: React.DragEventHandler<HTMLDivElement> = (
    event
  ) => {
    onDragLeaveCb(event, dragRef, () => setDraggedOver(false))
  }

  const onDropHandler = async (event: any) => {
    event.preventDefault()
    setDraggedOver(false)
    if (draggedResource.current == null || workspace == null) {
      return
    }

    if (draggedResource.current.result.workspaceId === workspace.id) {
      pushMessage({
        title: 'Oops',
        description: 'Resource is already present in this workspace',
      })
      return
    }

    if (draggedResource.current.type === 'folder') {
      const folder = draggedResource.current.result
      updateFolderHandler(folder, {
        workspaceId: workspace.id,
        description: folder.description,
        folderName: folder.name,
        emoji: folder.emoji,
      })
    } else if (draggedResource.current.type === 'doc') {
      const doc = draggedResource.current.result
      updateDocHandler(doc, {
        workspaceId: workspace.id,
      })
    }
  }

  const keyDownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!focused) {
        return
      }
      if (isSingleKeyEvent(event, shortcuts.unfoldFolder)) {
        preventKeyboardEventPropagation(event)
        unfoldItem('workspaces', workspace.id)
        return
      }
      if (isSingleKeyEvent(event, shortcuts.foldFolder)) {
        preventKeyboardEventPropagation(event)
        foldItem('workspaces', workspace.id)
        return
      }
    },
    [workspace, foldItem, unfoldItem, focused]
  )
  useCapturingGlobalKeyDownHandler(keyDownHandler)

  return (
    <StyledSideNavigatorBackground
      className={cc([draggedOver && 'dragged-over'])}
      onBlur={onBlurHandler}
    >
      <SideNavItemStyle
        draggable={false}
        onDragOver={onDragOverHandler}
        onDrop={onDropHandler}
        ref={dragRef}
        onDragLeave={onDragLeaveHandler}
        className={cc([
          pageWorkspace != null &&
            workspace != null &&
            pageWorkspace.id === workspace.id &&
            'active',
          draggedOver && 'dragged-over',
          focused && 'focused',
        ])}
      >
        <div className={cc(['sideNavWrapper'])}>
          <SideNavigatorFoldButton
            hasChildren={hasChildren}
            folded={folded}
            toggle={() => toggleItem('workspaces', workspace.id)}
            depth={1}
          />
          <SideNavClickableButtonStyle style={{ paddingLeft: `24px` }}>
            <SideNavIconStyle
              className={cc(['emoji-icon'])}
              style={{ width: 20 }}
            >
              {workspace.public ? (
                <Tooltip tooltip='Public Workspace' style={{ left: '50px' }}>
                  <IconMdi path={mdiFolderAccountOutline} size={16} />
                </Tooltip>
              ) : (
                <Tooltip tooltip='Private Workspace' style={{ left: '50px' }}>
                  <IconMdi path={mdiLockOutline} size={16} />
                </Tooltip>
              )}
            </SideNavIconStyle>
            {workspace.default ? (
              <TeamLink
                team={team}
                className='itemLink'
                id={`tree-Wp${getHexFromUUID(workspace.id)}`}
                onFocus={() => setFocused(true)}
              >
                <SideNavLabelStyle>{workspace.name}</SideNavLabelStyle>
              </TeamLink>
            ) : (
              <WorkspaceLink
                team={team}
                workspace={workspace}
                className='itemLink'
                id={`tree-Wp${getHexFromUUID(workspace.id)}`}
                onFocus={() => setFocused(true)}
              >
                <SideNavLabelStyle>{workspace.name}</SideNavLabelStyle>
              </WorkspaceLink>
            )}
          </SideNavClickableButtonStyle>
        </div>
        <SideNavControlStyle className='controls show-tooltip'>
          <SideNavigatorWorkspaceControls
            workspace={workspace}
            team={team}
            onNewFolderClick={() => setNewFolderFormIsOpened(true)}
          />
        </SideNavControlStyle>
      </SideNavItemStyle>
      {newFolderFormIsOpened && (
        <SideNavigatorFolderForm
          workspaceId={workspace.id}
          close={() => setNewFolderFormIsOpened(false)}
        />
      )}
      {!folded && (
        <SideNavigator
          workspace={workspace}
          draggedResource={draggedResource}
        />
      )}
    </StyledSideNavigatorBackground>
  )
}

export default SidebarWorkspaceItem
