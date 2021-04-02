import { useCallback } from 'react'
import {
  destroyWorkspace,
  DestroyWorkspaceResponseBody,
} from '../../../../cloud/api/teams/workspaces'
import { SerializedWorkspace } from '../../../../cloud/interfaces/db/workspace'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { useDialog } from '../../stores/dialog'
import { useToast } from '../../stores/toast'
import { getMapFromEntityArray } from '../../utils/array'
import useApi from '../useApi'

export function useWorkspaceDelete(workspace: SerializedWorkspace) {
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
    api: () =>
      destroyWorkspace({ id: workspace.teamId } as any, workspace, true),
    cb: ({ publicWorkspace }: DestroyWorkspaceResponseBody) => {
      removeFromWorkspacesMap(workspace.id)
      pushMessage({
        title: 'Success',
        type: 'success',
        description: 'Your workspace has been deleted',
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
    call: useCallback(() => {
      if (workspace.default) {
        return
      }
      messageBox({
        title: `Delete the workspace?`,
        message: `Are you sure to delete this workspace? You will not be able to revert this action.`,
        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          { variant: 'danger', label: 'Destroy All', onClick: submit },
        ],
      })
    }, [messageBox, submit, workspace.default]),
  }
}
