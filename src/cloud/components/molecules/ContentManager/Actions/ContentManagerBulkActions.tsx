import React, { useState, useCallback, useMemo } from 'react'
import Flexbox from '../../../atoms/Flexbox'
import HeaderAction from './HeaderAction'
import {
  mdiFileUndoOutline,
  mdiFolderMoveOutline,
  mdiArchiveOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import { SerializedDocWithBookmark } from '../../../../interfaces/db/doc'
import { SerializedTeam } from '../../../../interfaces/db/team'
import { useNav } from '../../../../lib/stores/nav'
import { difference } from 'ramda'
import {
  archiveDoc,
  unarchiveDoc,
  destroyDoc,
} from '../../../../api/teams/docs'
import {
  getDocIdFromString,
  getFolderIdFromString,
} from '../../../../lib/utils/patterns'
import { SerializedFolderWithBookmark } from '../../../../interfaces/db/folder'
import { destroyFolder } from '../../../../api/teams/folders'
import { getMapFromEntityArray } from '../../../../lib/utils/array'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../../shared/lib/stores/dialog'
import { SerializedWorkspace } from '../../../../interfaces/db/workspace'
import MoveItemModal from '../../../organisms/Modal/contents/Forms/MoveItemModal'
import { useModal } from '../../../../lib/stores/modal'

interface ContentManagerBulkActionsProps {
  team: SerializedTeam
  selectedDocs: Set<string>
  documentsMap: Map<string, SerializedDocWithBookmark>
  foldersMap: Map<string, SerializedFolderWithBookmark>
  workspacesMap: Map<string, SerializedWorkspace>
  selectedFolders: Set<string>
  updating: string[]
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
  setShowArchived: React.Dispatch<React.SetStateAction<boolean>>
}

enum BulkActions {
  move = 0,
  archive = 1,
  unarchive = 2,
  delete = 3,
}

const ContentManagerBulkActions = ({
  team,
  selectedDocs,
  selectedFolders,
  documentsMap,
  foldersMap,
  updating,
  setUpdating,
  setShowArchived,
}: ContentManagerBulkActionsProps) => {
  const [sending, setSending] = useState<number>()
  const {
    updateDocsMap,
    removeFromFoldersMap,
    removeFromDocsMap,
    updateFoldersMap,
    updateWorkspacesMap,
    updateDocHandler,
    updateFolderHandler,
  } = useNav()
  const { messageBox } = useDialog()
  const { openModal } = useModal()

  const selectedDocsAreUpdating = useMemo(() => {
    return (
      difference([...selectedDocs.values()].map(getDocIdFromString), updating)
        .length !== selectedDocs.size
    )
  }, [selectedDocs, updating])

  const selectedFoldersAreUpdating = useMemo(() => {
    return (
      difference(
        [...selectedFolders.values()].map(getDocIdFromString),
        updating
      ).length !== selectedFolders.size
    )
  }, [selectedFolders, updating])

  const moveSingleDoc = useCallback(
    async (docId: string, workspaceId: string, parentFolderId?: string) => {
      try {
        await updateDocHandler({ id: docId } as SerializedDocWithBookmark, {
          workspaceId,
          parentFolderId,
        })
      } catch (error) {}
    },
    [updateDocHandler]
  )

  const moveSingleFolder = useCallback(
    async (folderId: string, workspaceId: string, parentFolderId?: string) => {
      try {
        await updateFolderHandler(
          { id: folderId } as SerializedFolderWithBookmark,
          {
            workspaceId,
            parentFolderId,
            emoji: 'unchanged',
          }
        )
      } catch (error) {}
    },
    [updateFolderHandler]
  )

  const bulkMoveCallback = useCallback(
    async (workspaceId: string, parentFolderId?: string) => {
      if (
        selectedDocs.size + selectedFolders.size === 0 ||
        selectedDocsAreUpdating ||
        selectedFoldersAreUpdating
      ) {
        return
      }
      const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
      patternedIds.push(
        ...[...selectedFolders.values()].map(getFolderIdFromString)
      )
      setUpdating((prev) => [...prev, ...patternedIds])
      setSending(BulkActions.move)
      for (const folderId of selectedFolders.values()) {
        await moveSingleFolder(folderId, workspaceId, parentFolderId)
      }

      for (const docId of selectedDocs.values()) {
        await moveSingleDoc(docId, workspaceId, parentFolderId)
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [
      moveSingleFolder,
      moveSingleDoc,
      selectedDocs,
      selectedFolders,
      selectedDocsAreUpdating,
      selectedFoldersAreUpdating,
      setUpdating,
    ]
  )

  const openMoveForm = useCallback(
    () => openModal(<MoveItemModal onSubmit={bulkMoveCallback} />),
    [openModal, bulkMoveCallback]
  )

  const archiveSingleDoc = useCallback(
    async (teamId: string, docId: string) => {
      try {
        const data = await archiveDoc(teamId, docId)
        updateDocsMap([data.doc.id, data.doc])
      } catch (err) {}
    },
    [updateDocsMap]
  )

  const unArchiveSingleDoc = useCallback(
    async (teamId: string, docId: string) => {
      try {
        const data = await unarchiveDoc(teamId, docId)
        updateDocsMap([data.doc.id, data.doc])
      } catch (err) {}
    },
    [updateDocsMap]
  )

  const bulkArchiveCallback = useCallback(async () => {
    if (selectedDocs.size === 0 || selectedDocsAreUpdating) {
      return
    }
    const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
    setUpdating((prev) => [...prev, ...patternedIds])
    setSending(BulkActions.archive)
    for (const docId of selectedDocs.values()) {
      await archiveSingleDoc(team.id, docId)
    }
    setSending(undefined)
    setShowArchived(true)
    setUpdating((prev) => difference(prev, patternedIds))
  }, [
    team,
    archiveSingleDoc,
    selectedDocs,
    setUpdating,
    selectedDocsAreUpdating,
    setShowArchived,
  ])

  const bulkUnarchiveCallback = useCallback(async () => {
    if (selectedDocs.size === 0 || selectedDocsAreUpdating) {
      return
    }
    const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
    setUpdating((prev) => [...prev, ...patternedIds])
    setSending(BulkActions.unarchive)
    for (const docId of selectedDocs.values()) {
      await unArchiveSingleDoc(team.id, docId)
    }
    setSending(undefined)
    setUpdating((prev) => difference(prev, patternedIds))
  }, [
    team,
    unArchiveSingleDoc,
    selectedDocs,
    setUpdating,
    selectedDocsAreUpdating,
  ])

  const deleteSingleFolder = useCallback(
    async (team: SerializedTeam, target?: SerializedFolderWithBookmark) => {
      if (target == null) {
        return
      }
      try {
        const {
          parentFolder,
          workspace,
          docs,
          docsIds,
          foldersIds,
        } = await destroyFolder(team, target)

        foldersIds.forEach((folderId) => {
          removeFromFoldersMap(folderId)
        })

        if (docs == null) {
          docsIds.forEach((docId) => {
            removeFromDocsMap(docId)
          })
        } else {
          updateDocsMap(...getMapFromEntityArray(docs))
        }

        if (parentFolder != null) {
          updateFoldersMap([
            parentFolder.id,
            {
              ...parentFolder,
              childFoldersIds: parentFolder.childFoldersIds.filter(
                (id) => id !== target.id
              ),
            } as SerializedFolderWithBookmark,
          ])
        }

        if (workspace != null) {
          updateWorkspacesMap([workspace.id, workspace])
        }
      } catch (error) {}
    },
    [
      removeFromDocsMap,
      removeFromFoldersMap,
      updateDocsMap,
      updateFoldersMap,
      updateWorkspacesMap,
    ]
  )

  const deleteSingleDoc = useCallback(
    async (team: SerializedTeam, target?: SerializedDocWithBookmark) => {
      if (target == null || target.archivedAt == null) {
        return
      }
      try {
        const { doc, parentFolder, workspace } = await destroyDoc(team, target)
        removeFromDocsMap(target.id)
        if (parentFolder != null) {
          updateFoldersMap([parentFolder.id, parentFolder])
        }
        if (workspace != null) {
          updateWorkspacesMap([workspace.id, workspace])
        }
        if (doc != null) {
          updateDocsMap([doc.id, doc])
        }
      } catch (error) {}
    },
    [removeFromDocsMap, updateFoldersMap, updateWorkspacesMap, updateDocsMap]
  )

  const bulkDeleteCallback = useCallback(async () => {
    if (
      selectedDocs.size + selectedFolders.size === 0 ||
      selectedDocsAreUpdating ||
      selectedFoldersAreUpdating
    ) {
      return
    }
    messageBox({
      title: `Delete the selected items?`,
      message: `Selected folders, their content, and the selected archived documents will be permanently deleted.`,
      iconType: DialogIconTypes.Warning,
      buttons: [
        {
          variant: 'secondary',
          label: 'Cancel',
          cancelButton: true,
          defaultButton: true,
        },
        {
          variant: 'danger',
          label: 'Delete',
          onClick: async () => {
            const patternedIds = [...selectedDocs.values()].map(
              getDocIdFromString
            )
            patternedIds.push(
              ...[...selectedFolders.values()].map(getFolderIdFromString)
            )
            setUpdating((prev) => [...prev, ...patternedIds])
            setSending(BulkActions.delete)
            for (const folderId of selectedFolders.values()) {
              await deleteSingleFolder(team, foldersMap.get(folderId))
            }

            for (const docId of selectedDocs.values()) {
              await deleteSingleDoc(team, documentsMap.get(docId))
            }
            setSending(undefined)
            setUpdating((prev) => difference(prev, patternedIds))

            return
          },
        },
      ],
    })
  }, [
    selectedDocs,
    selectedFolders,
    selectedDocsAreUpdating,
    selectedFoldersAreUpdating,
    foldersMap,
    documentsMap,
    messageBox,
    deleteSingleFolder,
    deleteSingleDoc,
    setUpdating,
    team,
  ])

  const archiveBulkButtons = useMemo(() => {
    if (selectedDocs.size === 0) {
      return null
    }

    const docs = [...documentsMap.values()].filter((doc) =>
      selectedDocs.has(doc.id)
    )
    const nodes = []
    const hasOneArchivedDocSelected =
      docs.find((doc) => doc.archivedAt != null) != null

    if (docs.find((doc) => doc.archivedAt == null) != null) {
      nodes.push(
        <HeaderAction
          action={{
            iconPath: mdiArchiveOutline,
            onClick: bulkArchiveCallback,
            tooltip: 'Archive',
          }}
          key='archive'
          disabled={selectedDocsAreUpdating}
          sending={sending === BulkActions.archive}
        />
      )
    }

    if (hasOneArchivedDocSelected) {
      nodes.push(
        <HeaderAction
          action={{
            iconPath: mdiFileUndoOutline,
            onClick: bulkUnarchiveCallback,
            tooltip: 'Unarchive',
          }}
          key='unarchive'
          disabled={selectedDocsAreUpdating}
          sending={sending === BulkActions.unarchive}
        />
      )
    }

    return nodes
  }, [
    selectedDocs,
    documentsMap,
    bulkArchiveCallback,
    bulkUnarchiveCallback,
    sending,
    selectedDocsAreUpdating,
  ])

  const trashBulkButton = useMemo(() => {
    if (selectedFolders.size === 0 && selectedDocs.size === 0) {
      return null
    }

    const docs = [...documentsMap.values()].filter((doc) =>
      selectedDocs.has(doc.id)
    )

    if (docs.find((doc) => doc.archivedAt == null) != null) {
      return null
    }

    return (
      <HeaderAction
        action={{
          iconPath: mdiTrashCanOutline,
          onClick: bulkDeleteCallback,
          tooltip: 'Delete',
        }}
        disabled={selectedDocsAreUpdating || selectedFoldersAreUpdating}
        sending={sending === BulkActions.delete}
      />
    )
  }, [
    documentsMap,
    selectedDocsAreUpdating,
    sending,
    bulkDeleteCallback,
    selectedFolders,
    selectedDocs,
    selectedFoldersAreUpdating,
  ])

  if (selectedDocs.size === 0 && selectedFolders.size === 0) {
    return null
  }

  return (
    <Flexbox flex='0 0 auto' style={{ marginLeft: 15 }}>
      <HeaderAction
        action={{
          iconPath: mdiFolderMoveOutline,
          onClick: openMoveForm,
          tooltip: 'Move',
        }}
        disabled={selectedDocsAreUpdating || selectedFoldersAreUpdating}
        sending={sending === BulkActions.move}
      />
      {archiveBulkButtons}
      {trashBulkButton}
    </Flexbox>
  )
}

export default ContentManagerBulkActions
