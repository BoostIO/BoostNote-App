import { useCallback, useRef } from 'react'
import { NavResource } from '../../interfaces/resources'
import { useToast } from '../../../../shared/lib/stores/toast'
import { FolderDoc } from '../../../db/types'
import {
  UpdateFolderRequestBody,
  UpdateDocRequestBody,
  useLocalDB,
} from './useLocalDB'
import { getFolderName, getFolderPathname } from '../../../db/utils'
import { DraggedTo, SidebarDragState } from '../../../../shared/lib/dnd'
import { getResourceId } from '../../../db/patterns'
import { join } from 'path'

export function useLocalDnd() {
  const draggedResource = useRef<NavResource>()
  const { pushApiErrorMessage, pushMessage } = useToast()
  const { updateDocApi, updateFolder } = useLocalDB()

  const dropInWorkspace = useCallback(
    async (
      workspaceId: string,
      updateFolder: (folder: FolderDoc, body: UpdateFolderRequestBody) => void,
      updateDoc: (docId: string, body: UpdateDocRequestBody) => void
    ) => {
      if (draggedResource.current == null) {
        return
      }

      if (draggedResource.current.result._id === workspaceId) {
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
          oldPathname: getFolderPathname(folder._id),
          newPathname: '/' + getFolderName(folder),
        })
      } else if (draggedResource.current.type === 'doc') {
        const doc = draggedResource.current.result
        updateDoc(doc._id, {
          workspaceId: workspaceId,
          docProps: {
            folderPathname: '/',
          },
        })
      }
    },
    [pushMessage]
  )

  const dropInDocOrFolder = useCallback(
    async (
      workspaceId: string,
      targetedResource: NavResource,
      targetedPosition: SidebarDragState
    ) => {
      if (draggedResource.current == null || targetedPosition == null) {
        return
      }

      if (
        draggedResource.current.type === targetedResource.type &&
        draggedResource.current.result._id === targetedResource.result._id
      ) {
        return
      }

      try {
        const originalResourceId = getResourceId(draggedResource.current)
        if (draggedResource.current.type == 'doc') {
          if (targetedResource.type == 'folder') {
            // move doc to target item (folder) at position (before, in, after)
            if (targetedPosition == DraggedTo.insideFolder) {
              await updateDocApi(originalResourceId, {
                workspaceId: workspaceId,
                docProps: {
                  folderPathname: getFolderPathname(
                    targetedResource.result._id
                  ),
                },
              })
            }
          }
        } else {
          // move folder
          if (targetedResource.type == 'folder') {
            // move folder inside target folder
            if (targetedPosition == DraggedTo.insideFolder) {
              const folderResource = draggedResource.current?.result
              const folderOriginalPathname = getFolderPathname(
                folderResource._id
              )
              const targetFolderPathname = getFolderPathname(
                targetedResource.result._id
              )
              const newFolderPathname = join(
                targetFolderPathname,
                getFolderName(folderResource)
              )
              await updateFolder(draggedResource.current?.result, {
                workspaceId: workspaceId,
                oldPathname: folderOriginalPathname,
                newPathname: newFolderPathname,
              })
            }
          }
        }
      } catch (error) {
        console.warn('Error while doing drag and drop', error)
        pushApiErrorMessage(error)
      }
    },
    [pushApiErrorMessage, updateDocApi, updateFolder]
  )

  return {
    draggedResource,
    dropInWorkspace,
    dropInDocOrFolder,
  }
}
