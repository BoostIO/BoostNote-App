import React, { useCallback } from 'react'
import NavigatorItem from '../atoms/NavigatorItem'
import { mdiTextBoxOutline } from '@mdi/js'
import { useStorageRouter } from '../../lib/storageRouter'

interface NoteNavigatorItemProps {
  storageId: string
  noteId: string
  noteTitle: string
  noteFolderPath: string
  active: boolean
  depth: number
}

const NoteNavigatorItem = ({
  storageId,
  noteId,
  noteTitle,
  noteFolderPath,
  active,
  depth,
}: NoteNavigatorItemProps) => {
  const emptyTitle = noteTitle.trim().length === 0
  const { navigateToNote } = useStorageRouter()

  const navigate = useCallback(() => {
    navigateToNote(storageId, noteId, noteFolderPath)
  }, [navigateToNote, storageId, noteId, noteFolderPath])

  return (
    <NavigatorItem
      active={active}
      iconPath={mdiTextBoxOutline}
      label={emptyTitle ? 'Untitled' : noteTitle}
      depth={depth}
      subtle={emptyTitle}
      onClick={navigate}
    />
  )
}

export default NoteNavigatorItem
