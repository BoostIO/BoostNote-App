import React, { useMemo } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { useNav } from '../../../lib/stores/nav'
import ContentManager from '../../molecules/ContentManager'
import Application from '../../Application'
import { useRouter } from '../../../lib/router'
import { useCloudUI } from '../../../lib/hooks/useCloudUI'
import { mapWorkspaceBreadcrumb } from '../../../lib/mappers/topbarBreadcrumbs'

interface WorkspacePage {
  workspace: SerializedWorkspace
}

const WorkspacePage = ({ workspace }: WorkspacePage) => {
  const { team } = usePage()
  const { docsMap, foldersMap } = useNav()
  const { query, push } = useRouter()
  const {
    openNewFolderForm,
    openNewDocForm,
    openWorkspaceEditForm,
    deleteWorkspace,
  } = useCloudUI()

  const topbarBreadcrumbs = useMemo(() => {
    if (team == null) {
      return []
    }

    return [
      mapWorkspaceBreadcrumb(
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
    team,
    workspace,
    push,
    openNewFolderForm,
    openNewDocForm,
    openWorkspaceEditForm,
    deleteWorkspace,
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
      initialSidebarState={query.onboarding != null ? 'tree' : undefined}
      content={{
        topbar: {
          breadcrumbs: topbarBreadcrumbs,
        },
      }}
    >
      <ContentManager
        team={team}
        documents={childDocs}
        folders={childFolders}
        workspacesMap={workspaceMap}
      />
    </Application>
  )
}

export default WorkspacePage
