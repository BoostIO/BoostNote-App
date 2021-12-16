import React, { useMemo } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { useNav } from '../../lib/stores/nav'
import InviteCTAButton from '../buttons/InviteCTAButton'
import { mdiDotsHorizontal } from '@mdi/js'
import { useModal } from '../../../design/lib/stores/modal'
import FolderPageInviteSection from '../Onboarding/FolderPageInviteSection'
import { TopbarControlProps } from '../../../design/components/organisms/Topbar'
import WorkspaceContextMenu from './WorkspaceContextMenu'
import ApplicationPage from '../ApplicationPage'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import ApplicationTopbar from '../ApplicationTopbar'
import ApplicationContent from '../ApplicationContent'
import { getDefaultListView } from '../../lib/views/list'
import { getMapValues } from '../../../design/lib/utils/array'
import { ViewsManager } from '../Views'

const WorkspacePage = ({ workspace }: { workspace: SerializedWorkspace }) => {
  const { team, currentUserIsCoreMember } = usePage()
  const { docsMap, foldersMap, viewsMap } = useNav()
  const { openContextModal } = useModal()

  const childFolders = useMemo(() => {
    if (workspace == null) {
      return []
    }
    return [...foldersMap.values()].filter(
      (folder) =>
        folder.workspaceId === workspace.id && folder.parentFolderId == null
    )
  }, [foldersMap, workspace])

  const childDocs = useMemo(() => {
    if (workspace == null) {
      return []
    }
    return [...docsMap.values()].filter(
      (doc) => doc.workspaceId === workspace.id && doc.parentFolderId == null
    )
  }, [docsMap, workspace])

  const workspaceMap = useMemo(() => {
    const map = new Map<string, SerializedWorkspace>()
    if (workspace != null) {
      map.set(workspace.id, workspace)
    }
    return map
  }, [workspace])

  const topbarControls = useMemo(() => {
    if (team == null || workspace == null) {
      return undefined
    }

    const controls: TopbarControlProps[] = [
      {
        type: 'node',
        element: <InviteCTAButton origin='folder-page' key='invite-cta' />,
      },
    ]

    controls.push({
      type: 'button',
      variant: 'icon',
      iconPath: mdiDotsHorizontal,
      onClick: (event) =>
        openContextModal(
          event,
          <WorkspaceContextMenu
            currentWorkspace={workspace}
            currentUserIsCoreMember={currentUserIsCoreMember}
          />,
          {
            alignment: 'bottom-right',
            removePadding: true,
            hideBackground: true,
          }
        ),
    })

    return controls
  }, [workspace, currentUserIsCoreMember, openContextModal, team])

  const currentViews = useMemo(() => {
    if (workspace == null) {
      return []
    }

    const views = getMapValues(viewsMap)

    const filteredViews = views.filter(
      (view) => view.workspaceId === workspace.id
    )
    if (filteredViews.length === 0) {
      return [getDefaultListView({ type: 'workspace', target: workspace })]
    }

    return filteredViews
  }, [viewsMap, workspace])

  if (team == null) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>{'Team is missing'}</ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
    )
  }

  if (workspace == null) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>{'Workspace is missing'}</ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
    )
  }

  return (
    <ApplicationPage>
      <ApplicationTopbar controls={topbarControls} />
      <ApplicationContent>
        <FolderPageInviteSection />
        <ViewsManager
          parent={{ type: 'workspace', target: workspace }}
          views={currentViews}
          team={team}
          docs={childDocs}
          folders={childFolders}
          workspacesMap={workspaceMap}
          currentWorkspaceId={workspace.id}
          currentUserIsCoreMember={currentUserIsCoreMember}
        />
      </ApplicationContent>
    </ApplicationPage>
  )
}

export default WorkspacePage
