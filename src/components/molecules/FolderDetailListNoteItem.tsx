import React, { useCallback, useMemo } from 'react'
import FolderDetailListItem from './FolderDetailListItem'
import {
  mdiTrashCanOutline,
  mdiStar,
  mdiStarOutline,
  mdiFileDocumentOutline,
  mdiArchive,
  mdiFileUndoOutline,
} from '@mdi/js'
import { NoteDoc } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import { dateToRelativeString } from '../../lib/time'
import FolderDetailListItemControlButton from '../atoms/FolderDetailListItemControlButton'
import { useDb } from '../../lib/db'

interface FolderDetailListNoteItemProps {
  storageId: string
  note: NoteDoc
}

const FolderDetailListNoteItem = ({
  storageId,
  note,
}: FolderDetailListNoteItemProps) => {
  const { push } = useRouter()
  const {
    trashNote,
    untrashNote,
    purgeNote,
    bookmarkNote,
    unbookmarkNote,
  } = useDb()

  const navigateToFolder = useCallback(() => {
    push(
      `/app/storages/${storageId}/notes${
        note.folderPathname === '/' ? '' : note.folderPathname
      }/${note._id}`
    )
  }, [push, storageId, note._id, note.folderPathname])

  const meta = useMemo(() => {
    return `Updated ${dateToRelativeString(new Date(note.updatedAt))}`
  }, [note.updatedAt])

  const trash = useCallback(() => {
    trashNote(storageId, note._id)
  }, [trashNote, storageId, note._id])

  const untrash = useCallback(() => {
    untrashNote(storageId, note._id)
  }, [untrashNote, storageId, note._id])

  const purge = useCallback(() => {
    purgeNote(storageId, note._id)
  }, [purgeNote, storageId, note._id])

  const bookmarked = !!note.data.bookmarked

  const toggleBookmark = useCallback(() => {
    if (bookmarked) {
      unbookmarkNote(storageId, note._id)
    } else {
      bookmarkNote(storageId, note._id)
    }
  }, [bookmarkNote, unbookmarkNote, storageId, note._id, bookmarked])

  return (
    <FolderDetailListItem
      iconPath={mdiFileDocumentOutline}
      label={note.title}
      onClick={navigateToFolder}
      meta={meta}
      control={
        !note.trashed ? (
          <>
            <FolderDetailListItemControlButton
              iconPath={bookmarked ? mdiStar : mdiStarOutline}
              title={bookmarked ? 'Unbookmark Note' : 'Bookmark Note'}
              active={bookmarked}
              onClick={toggleBookmark}
            />
            <FolderDetailListItemControlButton
              iconPath={mdiArchive}
              title='Archive Note'
              onClick={trash}
            />
          </>
        ) : (
          <>
            <FolderDetailListItemControlButton
              iconPath={mdiFileUndoOutline}
              title='Restore Note'
              onClick={untrash}
            />
            <FolderDetailListItemControlButton
              iconPath={mdiTrashCanOutline}
              title='Delete permanently'
              onClick={purge}
            />
          </>
        )
      }
    />
  )
}

export default FolderDetailListNoteItem
