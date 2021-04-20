import React, { useMemo, useState, useCallback } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import {
  mdiLock,
  mdiTextBoxPlusOutline,
  mdiFolderMultiplePlusOutline,
  mdiFolderOutline,
  mdiFileDocumentOutline,
} from '@mdi/js'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { useNav } from '../../../lib/stores/nav'
import EmojiIcon from '../../atoms/EmojiIcon'
import RightLayoutHeaderButtons from '../../molecules/RightLayoutHeaderButtons'
import ContentManager from '../../molecules/ContentManager'
import Application from '../../Application'
import { useRouter } from '../../../lib/router'
import { topParentId } from '../../../../lib/v2/mappers/cloud/topbarTree'
import { getWorkspaceHref } from '../../atoms/Link/WorkspaceLink'
import { useModal } from '../../../../lib/v2/stores/modal'
import EmojiInputForm from '../../../../components/v2/organisms/EmojiInputForm'
import FlattenedBreadcrumbs from '../../../../components/v2/molecules/FlattenedBreadcrumbs'
import { useCloudUpdater } from '../../../../lib/v2/hooks/cloud/useCloudUpdater'

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
  const { openModal, closeLastModal } = useModal()
  const { query, push } = useRouter()
  const [sending, setSending] = useState<number>()
  const { createFolder, createDoc } = useCloudUpdater()

  const topbarBreadcrumbs = useMemo(() => {
    if (team == null) {
      return []
    }

    const workspaceHref = getWorkspaceHref(workspace, team, 'index')
    return [
      {
        label: workspace.name,
        active: true,
        parentId: topParentId,
        link: {
          href: workspaceHref,
          navigateTo: () => push(workspaceHref),
        },
      },
    ]
  }, [team, workspace, push])

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

  const openNewDocForm = useCallback(() => {
    openModal(
      <EmojiInputForm
        defaultIcon={mdiFileDocumentOutline}
        placeholder='Doc title'
        submitButtonProps={{
          label: 'Create',
          spinning: sending === WorkspaceHeaderActions.newDoc,
        }}
        prevRows={[
          {
            description: (
              <FlattenedBreadcrumbs breadcrumbs={topbarBreadcrumbs} />
            ),
          },
        ]}
        onSubmit={async (inputValue: string, emoji?: string) => {
          if (team == null || workspace == null) {
            return
          }
          setSending(WorkspaceHeaderActions.newDoc)
          await createDoc(
            team,
            {
              workspaceId: workspace.id,
              title: inputValue,
              emoji,
            },
            closeLastModal
          )
          setSending(undefined)
        }}
      />,
      {
        showCloseIcon: true,
        size: 'default',
        title: 'Create new doc',
      }
    )
  }, [
    openModal,
    closeLastModal,
    createDoc,
    workspace,
    sending,
    team,
    topbarBreadcrumbs,
  ])

  const openNewFolderForm = useCallback(() => {
    openModal(
      <EmojiInputForm
        defaultIcon={mdiFolderOutline}
        placeholder='Folder name'
        submitButtonProps={{
          label: 'Create',
          spinning: sending === WorkspaceHeaderActions.newFolder,
        }}
        prevRows={[
          {
            description: (
              <FlattenedBreadcrumbs breadcrumbs={topbarBreadcrumbs} />
            ),
          },
        ]}
        onSubmit={async (inputValue: string, emoji?: string) => {
          if (team == null || workspace == null) {
            return
          }
          setSending(WorkspaceHeaderActions.newFolder)
          await createFolder(
            team,
            {
              workspaceId: workspace.id,
              folderName: inputValue,
              description: '',
              emoji,
            },
            closeLastModal
          )
          setSending(undefined)
        }}
      />,
      {
        showCloseIcon: true,
        size: 'default',
        title: 'Create new folder',
      }
    )
  }, [
    openModal,
    closeLastModal,
    createFolder,
    workspace,
    sending,
    team,
    topbarBreadcrumbs,
  ])

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
                  onClick: openNewDocForm,
                },
                {
                  disabled: sending != null,
                  sending: sending === WorkspaceHeaderActions.newFolder,
                  tooltip: 'Create new folder',
                  iconPath: mdiFolderMultiplePlusOutline,
                  onClick: openNewFolderForm,
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
