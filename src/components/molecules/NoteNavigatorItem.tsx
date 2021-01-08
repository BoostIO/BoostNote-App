import React, { useCallback, MouseEventHandler } from 'react'
import NavigatorItem from '../atoms/NavigatorItem'
import { mdiCardTextOutline, mdiDotsVertical } from '@mdi/js'
import { useStorageRouter } from '../../lib/storageRouter'
import { NoteDoc } from '../../lib/db/types'
import NavigatorButton from '../atoms/NavigatorButton'
import { openContextMenu } from '../../lib/electronOnly'

interface NoteNavigatorItemProps {
  storageId: string
  noteId: string
  noteTitle: string
  noteFolderPath: string
  noteBookmarked: boolean
  active: boolean
  depth: number
  bookmarkNote: (
    storageId: string,
    noteId: string
  ) => Promise<NoteDoc | undefined>
  unbookmarkNote: (
    storageId: string,
    noteId: string
  ) => Promise<NoteDoc | undefined>
  trashNote: (storageId: string, noteId: string) => Promise<NoteDoc | undefined>
}

const NoteNavigatorItem = ({
  storageId,
  noteId,
  noteTitle,
  noteFolderPath,
  active,
  depth,
  noteBookmarked,
  bookmarkNote,
  unbookmarkNote,
  trashNote,
}: NoteNavigatorItemProps) => {
  const emptyTitle = noteTitle.trim().length === 0
  const { navigateToNote } = useStorageRouter()

  const navigate = useCallback(() => {
    navigateToNote(storageId, noteId, noteFolderPath)
  }, [navigateToNote, storageId, noteId, noteFolderPath])

  const openNoteContextMenu: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      openContextMenu({
        menuItems: [
          !noteBookmarked
            ? {
                label: 'Bookmark Note',
                click: () => {
                  bookmarkNote(storageId, noteId)
                },
              }
            : {
                label: 'Unbookmark Note',
                click: () => {
                  unbookmarkNote(storageId, noteId)
                },
              },
          { type: 'separator' },
          {
            label: 'Trash Note',
            click: () => {
              trashNote(storageId, noteId)
            },
          },
        ],
      })
    },
    [storageId, noteId, noteBookmarked, bookmarkNote, unbookmarkNote, trashNote]
  )

  return (
    <NavigatorItem
      active={active}
      iconPath={mdiCardTextOutline}
      label={emptyTitle ? 'Untitled' : noteTitle}
      depth={depth}
      subtle={emptyTitle}
      onClick={navigate}
      onContextMenu={openNoteContextMenu}
      control={
        <NavigatorButton
          iconPath={mdiDotsVertical}
          onClick={openNoteContextMenu}
        />
      }
    />
  )
}

export default NoteNavigatorItem
