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
import { updateDocStatus, destroyDoc } from '../../../../api/teams/docs'
import { getDocIdFromString } from '../../../../lib/utils/patterns'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../../shared/lib/stores/dialog'
import { SerializedWorkspace } from '../../../../interfaces/db/workspace'
import MoveItemModal from '../../../organisms/Modal/contents/Forms/MoveItemModal'
import { useModal } from '../../../../../shared/lib/stores/modal'

interface DocOnlyContentManagerBulkActionsProps {
  team: SerializedTeam
  selectedDocs: Set<string>
  documentsMap: Map<string, SerializedDocWithBookmark>
  workspacesMap: Map<string, SerializedWorkspace>
  updating: string[]
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
}

enum BulkActions {
  move = 0,
  archive = 1,
  unarchive = 2,
  delete = 3,
}

const DocOnlyContentManagerBulkActions = ({
  team,
  selectedDocs,
  documentsMap,
  updating,
  setUpdating,
}: DocOnlyContentManagerBulkActionsProps) => {
  const [sending, setSending] = useState<number>()
  const {
    updateDocsMap,
    removeFromDocsMap,
    updateFoldersMap,
    updateWorkspacesMap,
    updateDocHandler,
  } = useNav()
  const { messageBox } = useDialog()
  const { openModal } = useModal()

  const selectedDocsAreUpdating = useMemo(() => {
    return (
      difference([...selectedDocs.values()].map(getDocIdFromString), updating)
        .length !== selectedDocs.size
    )
  }, [selectedDocs, updating])

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

  const bulkMoveCallback = useCallback(
    async (workspaceId: string, parentFolderId?: string) => {
      if (selectedDocs.size === 0 || selectedDocsAreUpdating) {
        return
      }
      const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
      setUpdating((prev) => [...prev, ...patternedIds])
      setSending(BulkActions.move)

      for (const docId of selectedDocs.values()) {
        await moveSingleDoc(docId, workspaceId, parentFolderId)
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [moveSingleDoc, selectedDocs, selectedDocsAreUpdating, setUpdating]
  )

  const openMoveForm = useCallback(
    () => openModal(<MoveItemModal onSubmit={bulkMoveCallback} />),
    [openModal, bulkMoveCallback]
  )

  const archiveSingleDoc = useCallback(
    async (teamId: string, docId: string) => {
      try {
        const data = await updateDocStatus(teamId, docId, 'archived')
        updateDocsMap([data.doc.id, data.doc])
      } catch (err) {}
    },
    [updateDocsMap]
  )

  const unArchiveSingleDoc = useCallback(
    async (teamId: string, docId: string) => {
      try {
        const data = await updateDocStatus(teamId, docId, null)
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
    setUpdating((prev) => difference(prev, patternedIds))
  }, [
    team,
    archiveSingleDoc,
    selectedDocs,
    setUpdating,
    selectedDocsAreUpdating,
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
    if (selectedDocs.size === 0 || selectedDocsAreUpdating) {
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
            setUpdating((prev) => [...prev, ...patternedIds])
            setSending(BulkActions.delete)

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
    selectedDocsAreUpdating,
    documentsMap,
    messageBox,
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
    if (selectedDocs.size === 0) {
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
        disabled={selectedDocsAreUpdating}
        sending={sending === BulkActions.delete}
      />
    )
  }, [
    documentsMap,
    selectedDocsAreUpdating,
    sending,
    bulkDeleteCallback,
    selectedDocs,
  ])

  if (selectedDocs.size === 0) {
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
        disabled={selectedDocsAreUpdating}
        sending={sending === BulkActions.move}
      />
      {archiveBulkButtons}
      {trashBulkButton}
    </Flexbox>
  )
}

export default DocOnlyContentManagerBulkActions
