import React, { useCallback } from 'react'
import { NoteDoc, NoteStorage } from '../../lib/db/types'
import { useDb } from '../../lib/db'
import NavigatorItem from '../atoms/NavigatorItem'
import NavigatorButton from '../atoms/NavigatorButton'
import NavigatorHeader from '../atoms/NavigatorHeader'
import { mdiTextBoxOutline, mdiClose } from '@mdi/js'
import { useRouter, useRouteParams } from '../../lib/router'
import { useGeneralStatus } from '../../lib/generalStatus'
import NavigatorSeparator from '../atoms/NavigatorSeparator'
import { bookmarkItemId } from '../../lib/nav'

interface BookmarkNavigatorFragmentProps {
  storage: NoteStorage
}

const BookmarkNavigatorFragment = ({
  storage,
}: BookmarkNavigatorFragmentProps) => {
  const { unbookmarkNote } = useDb()
  const { push } = useRouter()
  const { sideNavOpenedItemSet, toggleSideNavOpenedItem } = useGeneralStatus()
  const opened = sideNavOpenedItemSet.has(bookmarkItemId)

  const toggleBookmarks = useCallback(() => {
    toggleSideNavOpenedItem(bookmarkItemId)
  }, [toggleSideNavOpenedItem])

  const params = useRouteParams()
  const bookmarkedNoteList = storage.bookmarkedItemIds
    .map((id) => {
      return storage.noteMap[id]
    })
    .filter((note) => note != null) as NoteDoc[]

  if (bookmarkedNoteList.length === 0) {
    return null
  }

  return (
    <>
      <NavigatorHeader
        label='Bookmarks'
        folded={!opened}
        onClick={toggleBookmarks}
      />
      {opened && (
        <>
          {bookmarkedNoteList.map((note) => {
            const active =
              params.name === 'storages.notes' &&
              params.storageId === storage.id &&
              params.noteId === note._id
            return (
              <NavigatorItem
                iconPath={mdiTextBoxOutline}
                depth={0}
                key={storage.id + note._id}
                label={note.title}
                active={active}
                onClick={() => {
                  push(
                    note.folderPathname === '/'
                      ? `/app/storages/${storage.id}/notes/${note._id}`
                      : `/app/storages/${storage.id}/notes${note.folderPathname}/${note._id}`
                  )
                }}
                control={
                  <NavigatorButton
                    iconPath={mdiClose}
                    title='Unbookmark'
                    onClick={() => {
                      unbookmarkNote(storage.id, note._id)
                    }}
                  />
                }
              />
            )
          })}
          <NavigatorSeparator />
        </>
      )}
    </>
  )
}

export default BookmarkNavigatorFragment
