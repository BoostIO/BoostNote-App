import React, { useState, useCallback, useMemo } from 'react'
import HeaderAction from './HeaderAction'
import { mdiFileUndoOutline, mdiTrashCanOutline } from '@mdi/js'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../design/lib/stores/dialog'
import { useNav } from '../../../lib/stores/nav'
import { destroyDoc, updateDocStatus } from '../../../api/teams/docs'
import { SerializedTeam } from '../../../interfaces/db/team'
import { difference } from 'ramda'
import { getDocIdFromString } from '../../../lib/utils/patterns'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import Flexbox from '../../../../design/components/atoms/Flexbox'

interface ContentManagerArchivesBulkActionsProps {
  team: SerializedTeam
  documentsMap: Map<string, SerializedDocWithBookmark>
  selectedDocs: Set<string>
  updating: string[]
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
}

enum ArchivesBulkActions {
  unarchive = 0,
  delete = 1,
}

const ContentManagerArchivesBulkActions = ({
  selectedDocs,
  documentsMap,
  team,
  updating,
  setUpdating,
}: ContentManagerArchivesBulkActionsProps) => {
  const [sending, setSending] = useState<number>()
  const { messageBox } = useDialog()
  const { removeFromDocsMap, updateDocsMap } = useNav()

  const disabled = useMemo(() => {
    return (
      difference([...selectedDocs.values()].map(getDocIdFromString), updating)
        .length !== selectedDocs.size
    )
  }, [selectedDocs, updating])

  const bulkUnarchiveCallback = useCallback(async () => {
    if (selectedDocs.size === 0 || disabled) {
      return
    }

    const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
    setUpdating((prev) => [...prev, ...patternedIds])
    setSending(ArchivesBulkActions.unarchive)
    for (const docId of selectedDocs.values()) {
      const data = await updateDocStatus(team.id, docId, null)
      updateDocsMap([data.doc.id, data.doc])
    }
    setSending(undefined)
    setUpdating((prev) => difference(prev, patternedIds))
  }, [team, selectedDocs, setUpdating, disabled, updateDocsMap])

  const deleteSingleDoc = useCallback(
    async (team: SerializedTeam, target?: SerializedDocWithBookmark) => {
      if (target == null) {
        return
      }

      try {
        await destroyDoc(team, target)
        removeFromDocsMap(target.id)
      } catch (error) {}
    },
    [removeFromDocsMap]
  )

  const bulkDeleteCallback = useCallback(() => {
    if (selectedDocs.size === 0 || disabled) {
      return
    }

    messageBox({
      title: `Delete?`,
      message: 'Do you want to permanently delete these documents?',
      iconType: DialogIconTypes.Question,
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
            setSending(ArchivesBulkActions.delete)
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
    deleteSingleDoc,
    setUpdating,
    documentsMap,
    messageBox,
    team,
    selectedDocs,
    disabled,
  ])

  if (selectedDocs.size === 0) {
    return null
  }

  return (
    <Flexbox flex='0 0 auto' style={{ marginLeft: 15 }}>
      <HeaderAction
        action={{
          iconPath: mdiFileUndoOutline,
          onClick: bulkUnarchiveCallback,
          tooltip: 'Unarchive',
        }}
        disabled={disabled}
        sending={sending === ArchivesBulkActions.unarchive}
      />
      <HeaderAction
        action={{
          iconPath: mdiTrashCanOutline,
          onClick: bulkDeleteCallback,
          tooltip: 'Delete',
        }}
        disabled={disabled}
        sending={sending === ArchivesBulkActions.delete}
      />
    </Flexbox>
  )
}

export default ContentManagerArchivesBulkActions
