import { useCallback } from 'react'
import {
  destroyWorkspace,
  DestroyWorkspaceResponseBody,
} from '../../api/teams/workspaces'
import { useNav } from '../stores/nav'
import useApi from '../../../design/lib/hooks/useApi'
import { getMapFromEntityArray } from '../../../design/lib/utils/array'
import { useDialog } from '../../../design/lib/stores/dialog'
import { useToast } from '../../../design/lib/stores/toast'
import { SerializedWorkspace } from '../../interfaces/db/workspace'

export function useWorkspaceDelete() {
  const {
    removeFromWorkspacesMap,
    docsMap,
    foldersMap,
    updateWorkspacesMap,
    updateFoldersMap,
    updateDocsMap,
    removeFromDocsMap,
    removeFromFoldersMap,
  } = useNav()
  const { messageBox } = useDialog()
  const { pushMessage } = useToast()

  const { sending, submit } = useApi({
    api: (workspace: { id: string; teamId: string; default?: boolean }) =>
      destroyWorkspace({ id: workspace.teamId } as any, workspace, true),
    cb: ({ publicWorkspace }: DestroyWorkspaceResponseBody, workspace) => {
      removeFromWorkspacesMap(workspace.id)
      pushMessage({
        title: 'Success',
        type: 'success',
        description: 'Your folder has been deleted',
      })

      const workspaceDocs = [...docsMap.values()].filter(
        (doc) => doc.workspaceId === workspace.id
      )
      const workspaceFolders = [...foldersMap.values()].filter(
        (folder) => folder.workspaceId === workspace.id
      )

      if (publicWorkspace != null) {
        const changedDocs = workspaceDocs.map((doc) => {
          doc.workspaceId = publicWorkspace.id
          return doc
        })
        updateDocsMap(...getMapFromEntityArray(changedDocs))
        const changedFolders = workspaceFolders.map((folder) => {
          folder.workspaceId = publicWorkspace.id
          return folder
        })
        updateFoldersMap(...getMapFromEntityArray(changedFolders))
        updateWorkspacesMap([publicWorkspace.id, publicWorkspace])
      } else {
        removeFromDocsMap(...workspaceDocs.map((doc) => doc.id))
        removeFromFoldersMap(...workspaceFolders.map((doc) => doc.id))
      }
    },
  })

  return {
    sending,
    call: useCallback(
      (workspace: SerializedWorkspace) => {
        if (workspace.default) {
          return
        }
        messageBox({
          title: `Delete the folder?`,
          message: `Are you sure to delete this folder? You will not be able to revert this action.`,
          buttons: [
            {
              variant: 'secondary',
              label: 'Cancel',
              cancelButton: true,
              defaultButton: true,
            },
            {
              variant: 'danger',
              label: 'Destroy All',
              onClick: () => submit(workspace),
            },
          ],
        })
      },
      [messageBox, submit]
    ),
  }
}
