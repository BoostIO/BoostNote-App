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
import { SerializedTeam } from '../../../interfaces/db/team'

const SUPPORTED_FILE_EXTENSIONS = ['.md', '.txt', '.html']
const FILE_ENCODING = 'utf-8'

export function useCloudDnd() {
  const {
    updateFoldersMap,
    updateDocsMap,
    updateWorkspacesMap,
    setCurrentPath,
  } = useNav()
  const { pageDoc, pageFolder } = usePage()
  const { pushApiErrorMessage } = useToast()

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
      const files = event.dataTransfer?.files
      if (files != null && files.length > 0) {
        return 'files'
      }

      const draggedResource = getDraggedResource(event)
      if (draggedResource === null) {
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
    []
  )

  const dropFilesInWorkspace = useCallback(
    async (
      event: any,
      workspaceId: string,
      team: SerializedTeam,
      createDoc: (
        team: SerializedTeam,
        body: { workspaceId: string; title: string; content?: string }
      ) => Promise<{ id: string }>
    ) => {
      const files = event.dataTransfer?.files
      if (files == null || files.length === 0) {
        return
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = getFileExtension(file.name)
        if (!SUPPORTED_FILE_EXTENSIONS.includes(ext)) {
          continue
        }

        try {
          const content = await readFileAsText(file)
          const title = file.name.replace(ext, '')
          await createDoc(team, {
            workspaceId,
            title,
            content,
          })
        } catch (err) {
          console.warn('Failed to create doc from file:', file.name, err)
        }
      }
    },
    []
  )

  function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.')
    return lastDot >= 0 ? filename.slice(lastDot).toLowerCase() : ''
  }

  async function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file, FILE_ENCODING)
    })
  }

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
    dropFilesInWorkspace,
    saveFolderTransferData,
    saveDocTransferData,
    clearDragTransferData,
  }
}
