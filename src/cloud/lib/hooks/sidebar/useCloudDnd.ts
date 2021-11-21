import { useCallback } from 'react'
import { UpdateDocRequestBody } from '../../../api/teams/docs'
import { UpdateFolderRequestBody } from '../../../api/teams/folders'
import { moveResource } from '../../../api/teams/resources'
import {
  CATEGORY_DRAG_TRANSFER_DATA_JSON,
  DOC_DRAG_TRANSFER_DATA_JSON,
  DocDataTransferItem,
  FOLDER_DRAG_TRANSFER_DATA_JSON,
  FolderDataTransferItem,
  NavResource,
} from '../../../interfaces/resources'
import { useNav } from '../../stores/nav'
import { usePage } from '../../stores/pageStore'
import {
  docToDataTransferItem,
  folderToDataTransferItem,
  getDraggedResource,
  getResourceId,
} from '../../utils/patterns'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SidebarDragState } from '../../../../design/lib/dnd'
import { useToast } from '../../../../design/lib/stores/toast'
import { getMapFromEntityArray } from '../../../../design/lib/utils/array'
import { readFile } from '../../../../lib/electronOnly'
import { useElectron } from '../../stores/electron'
import { useCloudApi } from '../useCloudApi'

export function useCloudDnd() {
  const {
    updateFoldersMap,
    updateDocsMap,
    updateWorkspacesMap,
    setCurrentPath,
  } = useNav()
  const { pageDoc, pageFolder, team } = usePage()
  const { pushApiErrorMessage, pushMessage } = useToast()
  const { usingElectron } = useElectron()
  const { createDoc } = useCloudApi()

  async function dropOutsideFileToFolder(
    event: any,
    workspaceId: string,
    folderId: string
  ) {
    if (team == null) {
      return
    }
    if (!usingElectron) {
      return
    }
    if (event.dataTransfer.files.length == 0) {
      return
    }
    for (const file of event.dataTransfer.files) {
      const fileBuffer = await readFile(file.path)
      if (['text/plain', 'text/markdown', 'text/html'].includes(file.type)) {
        const fileContent = fileBuffer.toString()
        await createDoc(team, {
          workspaceId: workspaceId,
          parentFolderId: folderId,
          title: 'Untitled',
          content: fileContent,
        })
      } else {
        pushMessage({
          title: 'Oops',
          description:
            'The dropeed file is not supported. Please select only TXT, MD and HTML files.',
        })
        return
      }
    }
  }

  const dropInWorkspace = useCallback(
    async (
      event: any,
      workspaceId: string,
      updateFolder: (
        folder: FolderDataTransferItem,
        body: UpdateFolderRequestBody
      ) => Promise<void>,
      updateDoc: (
        doc: DocDataTransferItem,
        body: UpdateDocRequestBody
      ) => Promise<void>
    ) => {
      const draggedResource = getDraggedResource(event)
      if (draggedResource === null) {
        return
      }

      if (draggedResource.resource.workspaceId === workspaceId) {
        pushMessage({
          title: 'Oops',
          description: 'Resource is already present in this space',
        })
        return
      }

      if (draggedResource.type === 'folder') {
        const folder = draggedResource.resource
        await updateFolder(folder, {
          workspaceId: workspaceId,
          description: folder.description,
          folderName: folder.name,
          emoji: folder.emoji,
        })
      } else if (draggedResource.type === 'doc') {
        const doc = draggedResource.resource
        await updateDoc(doc, {
          workspaceId: workspaceId,
          title: doc.title,
          emoji: doc.emoji,
        })
      }
    },
    [pushMessage]
  )

  const dropInDocOrFolder = useCallback(
    async (
      event: any,
      targetedResource: NavResource,
      targetedPosition: SidebarDragState
    ) => {
      const draggedResource = getDraggedResource(event)
      if (draggedResource === null || targetedPosition == null) {
        return
      }

      if (
        draggedResource.type === targetedResource.type &&
        draggedResource.resource.id === targetedResource.resource.id
      ) {
        return
      }

      try {
        const originalResourceId = getResourceId(draggedResource)
        const pos = targetedPosition
        const { folders, docs, workspaces } = await moveResource(
          { id: draggedResource.resource.teamId },
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

  const saveFolderTransferData = useCallback(
    (event: any, folder: SerializedFolderWithBookmark) => {
      const folderDataTransferItem = folderToDataTransferItem(folder)
      event.dataTransfer.setData(
        FOLDER_DRAG_TRANSFER_DATA_JSON,
        JSON.stringify(folderDataTransferItem)
      )
      event.dataTransfer.setData(
        'text/plain',
        `${folderDataTransferItem.name} ${folderDataTransferItem.url}`
      )
    },
    []
  )

  const saveDocTransferData = useCallback(
    (event: any, doc: SerializedDocWithSupplemental) => {
      const docDataTransferItem = docToDataTransferItem(doc)
      event.dataTransfer.setData(
        DOC_DRAG_TRANSFER_DATA_JSON,
        JSON.stringify(docDataTransferItem)
      )
      event.dataTransfer.setData(
        'text/plain',
        `${docDataTransferItem.title} ${docDataTransferItem.url}`
      )
    },
    []
  )

  const clearDragTransferData = useCallback((event: any) => {
    event.dataTransfer.setData(DOC_DRAG_TRANSFER_DATA_JSON, '')
    event.dataTransfer.setData(FOLDER_DRAG_TRANSFER_DATA_JSON, '')
    event.dataTransfer.setData(CATEGORY_DRAG_TRANSFER_DATA_JSON, '')
  }, [])

  return {
    dropInWorkspace,
    dropInDocOrFolder,
    saveFolderTransferData,
    saveDocTransferData,
    clearDragTransferData,
    dropOutsideFileToFolder,
  }
}
