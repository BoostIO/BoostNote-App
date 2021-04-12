import React, { useMemo, useState, useCallback } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import {
  mdiLock,
  mdiTextBoxPlusOutline,
  mdiFolderMultiplePlusOutline,
} from '@mdi/js'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { useNav } from '../../../lib/stores/nav'
import BreadCrumbs from '../RightSideTopBar/BreadCrumbs'
import { useModal } from '../../../lib/stores/modal'
import SingleInputModal from '../Modal/contents/Forms/SingleInputModal'
import EmojiIcon from '../../atoms/EmojiIcon'
import RightLayoutHeaderButtons from '../../molecules/RightLayoutHeaderButtons'
import ContentManager from '../../molecules/ContentManager'
import Application from '../../Application'

interface WorkspacePage {
  workspace: SerializedWorkspace
}

enum WorkspaceHeaderActions {
  newDoc = 0,
  newFolder = 1,
}

const WorkspacePage = ({ workspace }: WorkspacePage) => {
  const { team } = usePage()
  const {
    docsMap,
    foldersMap,
    createFolderHandler,
    createDocHandler,
  } = useNav()
  const { openModal } = useModal()
  const [sending, setSending] = useState<number>()

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

  const submitNewDoc = useCallback(async () => {
    try {
      setSending(WorkspaceHeaderActions.newDoc)
      await createDocHandler({
        workspaceId: workspace.id,
      })
    } catch (error) {}
    setSending(undefined)
  }, [createDocHandler, workspace])

  const workspaceMap = useMemo(() => {
    const map = new Map<string, SerializedWorkspace>()
    map.set(workspace.id, workspace)
    return map
  }, [workspace])

  const submitNewFolder = useCallback(
    async (name: string) => {
      if (name.trim() === '') {
        return
      }

      try {
        setSending(WorkspaceHeaderActions.newFolder)
        await createFolderHandler({
          workspaceId: workspace.id,
          folderName: name,
          description: '',
        })
      } catch (error) {}

      setSending(undefined)
    },
    [createFolderHandler, workspace]
  )

  const openNewFolderForm = useCallback(() => {
    openModal(
      <SingleInputModal
        content={<p>Name of your new folder</p>}
        onSubmit={submitNewFolder}
      />,
      {
        classNames: 'fit-content',
      }
    )
  }, [openModal, submitNewFolder])

  if (team == null) {
    return <Application content={{}} />
  }

  return (
    <Application
      content={{
        reduced: true,
        topbar: {
          type: 'v1',
          left: <BreadCrumbs team={team} />,
        },
        header: (
          <>
            {!workspace.public && (
              <EmojiIcon defaultIcon={mdiLock} style={{ marginRight: 10 }} />
            )}
            <span style={{ marginRight: 10 }}>{workspace.name}</span>
            <RightLayoutHeaderButtons
              buttons={[
                {
                  disabled: sending != null,
                  sending: sending === WorkspaceHeaderActions.newDoc,
                  tooltip: 'Create new doc',
                  iconPath: mdiTextBoxPlusOutline,
                  onClick: submitNewDoc,
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
