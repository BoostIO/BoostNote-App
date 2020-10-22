import React, { useCallback } from 'react'
import FolderDetailListItem from './FolderDetailListItem'
import { mdiTextBoxOutline } from '@mdi/js'
import { NoteDoc } from '../../lib/db/types'
import { useRouter } from '../../lib/router'

interface FolderDetailListNoteItemProps {
  storageId: string
  note: NoteDoc
}

const FolderDetailListNoteItem = ({
  storageId,
  note,
}: FolderDetailListNoteItemProps) => {
  const { push } = useRouter()

  const navigateToFolder = useCallback(() => {
    push(`/app/storages/${storageId}/notes${note.folderPathname}/${note._id}`)
  }, [push, storageId, note._id, note.folderPathname])

  return (
    <FolderDetailListItem
      iconPath={mdiTextBoxOutline}
      label={note.title.trim().length === 0 ? 'Untitled' : note.title}
      onClick={navigateToFolder}
    />
  )
}

export default FolderDetailListNoteItem
