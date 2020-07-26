import React, { useMemo, useCallback } from 'react'
import { NoteDoc, NoteStorage } from '../../lib/db/types'
import { useDb } from '../../lib/db'
import NavigatorItem from '../atoms/NavigatorItem'
import NavigatorButton from '../atoms/NavigatorButton'
import NavigatorHeader from '../atoms/NavigatorHeader'
import { mdiTextBoxOutline, mdiClose } from '@mdi/js'
import { useRouter, useRouteParams } from '../../lib/router'
import { useGeneralStatus } from '../../lib/generalStatus'
import NavigatorSeparator from '../atoms/NavigatorSeparator'

const navItemName = 'bookmarks'

interface BookmarkNavigatorFragmentProps {
  storageEntries: [string, NoteStorage][]
}

const BookmarkNavigatorFragment = ({
  storageEntries,
}: BookmarkNavigatorFragmentProps) => {
  const { unbookmarkNote } = useDb()
  const { push } = useRouter()
  const { sideNavOpenedItemSet, toggleSideNavOpenedItem } = useGeneralStatus()
  const opened = sideNavOpenedItemSet.has(navItemName)

  const toggleBookmarks = useCallback(() => {
    toggleSideNavOpenedItem(navItemName)
  }, [toggleSideNavOpenedItem])

  const params = useRouteParams()

  const bookmarkedList = useMemo(() => {
    return storageEntries.reduce<[string, NoteDoc][]>((list, entry) => {
      const storage = entry[1]
      const bookmarkedNoteList = storage.bookmarkedItemIds
        .map((id) => {
          return storage.noteMap[id]
        })
        .filter((note) => note != null) as NoteDoc[]

      return [
        ...list,
        ...bookmarkedNoteList.map(
          (note) => [storage.id, note] as [string, NoteDoc]
        ),
      ]
    }, [])
  }, [storageEntries])

  if (bookmarkedList.length === 0) {
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
          {bookmarkedList.map(([storageId, note]) => {
            const active =
              params.name === 'storages.notes' &&
              params.storageId === storageId &&
              params.noteId === note._id
            return (
              <NavigatorItem
                iconPath={mdiTextBoxOutline}
                depth={0}
                key={storageId + note._id}
                label={note.title}
                active={active}
                onClick={() => {
                  push(
                    note.folderPathname === '/'
                      ? `/app/storages/${storageId}/notes/${note._id}`
                      : `/app/storages/${storageId}/notes${note.folderPathname}/${note._id}`
                  )
                }}
                control={
                  <NavigatorButton
                    iconPath={mdiClose}
                    title='Unbookmark'
                    onClick={() => {
                      unbookmarkNote(storageId, note._id)
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
