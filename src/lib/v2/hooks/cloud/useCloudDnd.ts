import { useCallback, useRef } from 'react'
import { UpdateDocRequestBody } from '../../../../cloud/api/teams/docs'
import { UpdateFolderRequestBody } from '../../../../cloud/api/teams/folders'
import { moveResource } from '../../../../cloud/api/teams/resources'
import { SerializedDoc } from '../../../../cloud/interfaces/db/doc'
import { SerializedFolder } from '../../../../cloud/interfaces/db/folder'
import { NavResource } from '../../../../cloud/interfaces/resources'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { getResourceId } from '../../../../cloud/lib/utils/patterns'
import { SidebarDragState } from '../../dnd'
import { useToast } from '../../stores/toast'
import { getMapFromEntityArray } from '../../utils/array'

export function useCloudDnd() {
  const draggedResource = useRef<NavResource>()
  const {
    updateFoldersMap,
    updateDocsMap,
    updateWorkspacesMap,
    setCurrentPath,
  } = useNav()
  const { pageDoc, pageFolder } = usePage()
  const { pushApiErrorMessage, pushMessage } = useToast()

  const dropInWorkspace = useCallback(
    async (
      workspaceId: string,
      updateFolder: (
        folder: SerializedFolder,
        body: UpdateFolderRequestBody
      ) => void,
      updateDoc: (doc: SerializedDoc, body: UpdateDocRequestBody) => void
    ) => {
      if (draggedResource.current == null) {
        return
      }

      if (draggedResource.current.result.workspaceId === workspaceId) {
        pushMessage({
          title: 'Oops',
          description: 'Resource is already present in this workspace',
        })
        return
      }

      if (draggedResource.current.type === 'folder') {
        const folder = draggedResource.current.result
        updateFolder(folder, {
          workspaceId: workspaceId,
          description: folder.description,
          folderName: folder.name,
          emoji: folder.emoji,
        })
      } else if (draggedResource.current.type === 'doc') {
        const doc = draggedResource.current.result
        updateDoc(doc, {
          workspaceId: workspaceId,
        })
      }
    },
    [pushMessage]
  )

  const dropInDocOrFolder = useCallback(
    async (
      targetedResource: NavResource,
      targetedPosition: SidebarDragState
    ) => {
      if (draggedResource.current == null || targetedPosition == null) {
        return
      }

      if (
        draggedResource.current.type === targetedResource.type &&
        draggedResource.current.result.id === targetedResource.result.id
      ) {
        return
      }

      try {
        const originalResourceId = getResourceId(draggedResource.current)
        const pos = targetedPosition
        const { folders, docs, workspaces } = await moveResource(
          { id: draggedResource.current.result.teamId },
          originalResourceId,
          {
            targetedPosition: pos,
            targetedResourceId: getResourceId(targetedResource),
          }
        )

        const changedFolders = getMapFromEntityArray(folders)
        updateFoldersMap(...changedFolders)

        const changedDocs = getMapFromEntityArray(docs)
        updateDocsMap(...changedDocs)

        if (workspaces != null) {
          updateWorkspacesMap(...getMapFromEntityArray(workspaces))
        }

        if (pageFolder != null && changedFolders.get(pageFolder.id) != null) {
          setCurrentPath(changedFolders.get(pageFolder.id)!.pathname)
        }

        if (pageDoc != null && changedDocs.get(pageDoc.id) != null) {
          setCurrentPath(changedDocs.get(pageDoc.id)!.folderPathname)
        }
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [
      updateDocsMap,
      updateFoldersMap,
      updateWorkspacesMap,
      pageDoc,
      pageFolder,
      pushApiErrorMessage,
      setCurrentPath,
    ]
  )

  return {
    draggedResource,
    dropInWorkspace,
    dropInDocOrFolder,
  }
}
