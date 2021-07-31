import React, { useMemo } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { useNav } from '../../../lib/stores/nav'
import ContentManager from '../../molecules/ContentManager'
import Application from '../../Application'
import { useRouter } from '../../../lib/router'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'
import { mapWorkspaceBreadcrumb } from '../../../lib/mappers/topbarBreadcrumbs'
import { useI18n } from '../../../lib/hooks/useI18n'
import InviteCTAButton from '../../molecules/InviteCTAButton'

interface WorkspacePage {
  workspace: SerializedWorkspace
}

const WorkspacePage = ({ workspace }: WorkspacePage) => {
  const { team, currentUserIsCoreMember } = usePage()
  const { docsMap, foldersMap } = useNav()
  const { push } = useRouter()
  const {
    openNewFolderForm,
    openNewDocForm,
    openWorkspaceEditForm,
    deleteWorkspace,
  } = useCloudResourceModals()
  const { translate } = useI18n()

  const topbarBreadcrumbs = useMemo(() => {
    if (team == null) {
      return []
    }

    if (!currentUserIsCoreMember) {
      return [mapWorkspaceBreadcrumb(translate, team, workspace, push)]
    }

    return [
      mapWorkspaceBreadcrumb(
        translate,
        team,
        workspace,
        push,
        openNewDocForm,
        openNewFolderForm,
        openWorkspaceEditForm,
        deleteWorkspace
      ),
    ]
  }, [
    translate,
    team,
    workspace,
    push,
    openNewFolderForm,
    openNewDocForm,
    openWorkspaceEditForm,
    deleteWorkspace,
    currentUserIsCoreMember,
  ])

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
    map.set(workspace.id, workspace)
    return map
  }, [workspace])

  if (team == null) {
    return <Application content={{}} />
  }

  return (
    <Application
      content={{
        topbar: {
          breadcrumbs: topbarBreadcrumbs,
          controls: [
            {
              type: 'node',
              element: <InviteCTAButton origin='folder-page' />,
            },
          ],
        },
      }}
    >
      <ContentManager
        team={team}
        documents={childDocs}
        folders={childFolders}
        workspacesMap={workspaceMap}
        currentWorkspaceId={workspace.id}
        currentUserIsCoreMember={currentUserIsCoreMember}
      />
    </Application>
  )
}

export default WorkspacePage
