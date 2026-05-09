import { useCallback } from 'react'
import {
  createDoc,
  CreateDocRequestBody,
  UpdateDocRequestBody,
} from '../../../api/teams/docs'
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
import { SerializedTeam } from '../../../interfaces/db/team'
import { SidebarDragState } from '../../../../design/lib/dnd'
import { useToast } from '../../../../design/lib/stores/toast'
import { getMapFromEntityArray } from '../../../../design/lib/utils/array'

const textFileExtensions = new Set(['.md', '.txt', '.html', '.htm'])

function getDroppedFiles(event: any) {
  return Array.from<File>(event.dataTransfer?.files || []).filter((file) => {
    const lowerCaseName = file.name.toLowerCase()
    return Array.from(textFileExtensions).some((extension) =>
      lowerCaseName.endsWith(extension)
    )
  })
}

function getDocTitleFromFileName(fileName: string) {
  const matchingExtension = Array.from(textFileExtensions).find((extension) =>
    fileName.toLowerCase().endsWith(extension)
  )

  if (matchingExtension == null) {
    return fileName
  }

  return fileName.slice(0, -matchingExtension.length) || fileName
}

function readTextFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export function useCloudDnd() {
  const {
    updateFoldersMap,
    updateDocsMap,
    updateWorkspacesMap,
    updateParentFolderOfDoc,
    updateParentWorkspaceOfDoc,
    setCurrentPath,
  } = useNav()
  const { pageDoc, pageFolder } = usePage()
  const { pushApiErrorMessage } = useToast()

  const dropFilesAsDocs = useCallback(
    async (
      event: any,
      team: SerializedTeam,
      destination: Pick<CreateDocRequestBody, 'workspaceId' | 'parentFolderId'>
    ) => {
      const files = getDroppedFiles(event)
      if (files.length === 0) {
        return false
      }

      event.preventDefault()
      event.stopPropagation()

      try {
        for (const file of files) {
          const content = await readTextFile(file)
          const { doc } = await createDoc(
            { id: team.id },
            {
              ...destination,
              title: getDocTitleFromFileName(file.name),
              content,
            }
          )

          updateDocsMap([doc.id, doc])

          if (doc.parentFolder != null) {
            updateParentFolderOfDoc(doc)
          } else if (doc.workspace != null) {
            updateParentWorkspaceOfDoc(doc)
          }
        }
      } catch (error) {
        pushApiErrorMessage(error)
      }

      return true
    },
    [
      pushApiErrorMessage,
      updateDocsMap,
      updateParentFolderOfDoc,
      updateParentWorkspaceOfDoc,
    ]
  )

  const dropInWorkspace = useCallback(
    async (
      event: any,
      team: SerializedTeam,
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
      const droppedFiles = await dropFilesAsDocs(event, team, { workspaceId })
      if (droppedFiles) {
        return
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
    [dropFilesAsDocs]
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
    dropFilesAsDocs,
    dropInWorkspace,
    dropInDocOrFolder,
    saveFolderTransferData,
    saveDocTransferData,
    clearDragTransferData,
  }
}
