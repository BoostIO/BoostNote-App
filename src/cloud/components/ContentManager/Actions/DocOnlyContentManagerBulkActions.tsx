import React, { useState, useCallback, useMemo } from 'react'
import HeaderActionButton from './HeaderActionButton'
import { mdiFolderMoveOutline, mdiTrashCanOutline } from '@mdi/js'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useNav } from '../../../lib/stores/nav'
import { difference } from 'ramda'
import { destroyDoc } from '../../../api/teams/docs'
import { getDocIdFromString } from '../../../lib/utils/patterns'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../design/lib/stores/dialog'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import MoveItemModal from '../../Modal/contents/Forms/MoveItemModal'
import { useModal } from '../../../../design/lib/stores/modal'
import Flexbox from '../../../../design/components/atoms/Flexbox'

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
      message: `Selected folders, their content, and the selected documents will be permanently deleted.`,
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

  const trashBulkButton = useMemo(() => {
    if (selectedDocs.size === 0) {
      return null
    }

    return (
      <HeaderActionButton
        action={{
          iconPath: mdiTrashCanOutline,
          onClick: bulkDeleteCallback,
          tooltip: 'Delete',
        }}
        disabled={selectedDocsAreUpdating}
        sending={sending === BulkActions.delete}
      />
    )
  }, [selectedDocsAreUpdating, sending, bulkDeleteCallback, selectedDocs])

  if (selectedDocs.size === 0) {
    return null
  }

  return (
    <Flexbox flex='0 0 auto' style={{ marginLeft: 15 }}>
      <HeaderActionButton
        action={{
          iconPath: mdiFolderMoveOutline,
          onClick: openMoveForm,
          tooltip: 'Move',
        }}
        disabled={selectedDocsAreUpdating}
        sending={sending === BulkActions.move}
      />
      {trashBulkButton}
    </Flexbox>
  )
}

export default DocOnlyContentManagerBulkActions
