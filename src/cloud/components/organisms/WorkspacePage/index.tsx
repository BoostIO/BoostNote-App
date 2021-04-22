import React, { useMemo, useState, useCallback } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import {
  mdiLock,
  mdiTextBoxPlusOutline,
  mdiFolderMultiplePlusOutline,
} from '@mdi/js'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { useNav } from '../../../lib/stores/nav'
import EmojiIcon from '../../atoms/EmojiIcon'
import RightLayoutHeaderButtons from '../../molecules/RightLayoutHeaderButtons'
import ContentManager from '../../molecules/ContentManager'
import Application from '../../Application'
import { useRouter } from '../../../lib/router'
import FlattenedBreadcrumbs from '../../../../components/v2/molecules/FlattenedBreadcrumbs'
import { useCloudUI } from '../../../../shared/lib/hooks/cloud/useCloudUI'
import { mapWorkspaceBreadcrumb } from '../../../../shared/lib/mappers/cloud/topbarBreadcrumbs'

interface WorkspacePage {
  workspace: SerializedWorkspace
}

enum WorkspaceHeaderActions {
  newDoc = 0,
  newFolder = 1,
}

const WorkspacePage = ({ workspace }: WorkspacePage) => {
  const { team } = usePage()
  const { docsMap, foldersMap } = useNav()
  const { query, push } = useRouter()
  const [sending, setSending] = useState<number>()
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

  const openCreateDocForm = useCallback(() => {
    openNewDocForm(
      {
        team,
        workspaceId: workspace.id,
      },
      {
        before: () => setSending(WorkspaceHeaderActions.newDoc),
        after: () => setSending(undefined),
      },
      [
        {
          description: <FlattenedBreadcrumbs breadcrumbs={topbarBreadcrumbs} />,
        },
      ]
    )
  }, [openNewDocForm, workspace, team, topbarBreadcrumbs])

  const openCreateFolderForm = useCallback(() => {
    openNewFolderForm(
      {
        team,
        workspaceId: workspace.id,
      },
      {
        before: () => setSending(WorkspaceHeaderActions.newFolder),
        after: () => setSending(undefined),
      },
      [
        {
          description: <FlattenedBreadcrumbs breadcrumbs={topbarBreadcrumbs} />,
        },
      ]
    )
  }, [openNewFolderForm, workspace, team, topbarBreadcrumbs])

  if (team == null) {
    return <Application content={{}} />
  }

  return (
    <Application
      initialSidebarState={query.onboarding != null ? 'tree' : undefined}
      content={{
        reduced: true,
        topbar: {
          breadcrumbs: topbarBreadcrumbs,
        },
        header: (
          <>
            {!workspace.public && (
              <EmojiIcon
                defaultIcon={mdiLock}
                style={{ marginRight: 10 }}
                size={20}
              />
            )}
            <span style={{ marginRight: 10 }}>{workspace.name}</span>
            <RightLayoutHeaderButtons
              buttons={[
                {
                  disabled: sending != null,
                  sending: sending === WorkspaceHeaderActions.newDoc,
                  tooltip: 'Create new doc',
                  iconPath: mdiTextBoxPlusOutline,
                  onClick: openCreateDocForm,
                },
                {
                  disabled: sending != null,
                  sending: sending === WorkspaceHeaderActions.newFolder,
                  tooltip: 'Create new folder',
                  iconPath: mdiFolderMultiplePlusOutline,
                  onClick: openCreateFolderForm,
                },
              ]}
            />
          </>
        ),
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
