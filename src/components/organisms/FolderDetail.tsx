import React, { useMemo } from 'react'
import { NoteStorage, NoteDoc } from '../../lib/db/types'
import {
  values,
  isDirectSubPathname,
  getFolderNameFromPathname,
} from '../../lib/db/utils'
import PageContainer from '../atoms/PageContainer'
import FolderDetailListFolderItem from '../molecules/FolderDetailListFolderItem'
import FolderDetailListNoteItem from '../molecules/FolderDetailListNoteItem'
import { usePreferences } from '../../lib/preferences'

interface FolderDetailProps {
  storage: NoteStorage
  folderPathname: string
}

const FolderDetail = ({ storage, folderPathname }: FolderDetailProps) => {
  const { preferences } = usePreferences()
  const noteSorting = preferences['general.noteSorting']
  const subFolders = useMemo(() => {
    const folders = values(storage.folderMap)
    return folders
      .filter((folder) => {
        return isDirectSubPathname(folderPathname, folder.pathname)
      })
      .sort((a, b) => {
        return a.pathname.localeCompare(b.pathname)
      })
  }, [storage.folderMap, folderPathname])

  const notes = useMemo(() => {
    const folder = storage.folderMap[folderPathname]
    if (folder == null) {
      return []
    }

    return [...folder.noteIdSet]
      .reduce((notes, noteId) => {
        const note = storage.noteMap[noteId]
        if (note != null && !note.trashed) {
          notes.push(note)
        }
        return notes
      }, [] as NoteDoc[])
      .sort((a, b) => {
        switch (noteSorting) {
          case 'created-date-asc':
            return a.createdAt.localeCompare(b.createdAt)
          case 'created-date-dsc':
            return -a.createdAt.localeCompare(b.createdAt)
          case 'title-asc':
            return a.title.localeCompare(b.title)
          case 'title-dsc':
            return -a.title.localeCompare(b.title)
          case 'updated-date-asc':
            return a.updatedAt.localeCompare(b.updatedAt)
          case 'updated-date-dsc':
          default:
            return -a.updatedAt.localeCompare(b.updatedAt)
        }
      })
  }, [storage, folderPathname, noteSorting])

  return (
    <PageContainer>
      <h1>
        {folderPathname === '/'
          ? 'Workspace'
          : getFolderNameFromPathname(folderPathname)}
      </h1>
      <ul>
        {subFolders.map((folder) => {
          return (
            <FolderDetailListFolderItem
              key={folder._id}
              storageId={storage.id}
              folder={folder}
            />
          )
        })}
        {notes.map((note) => {
          return (
            <FolderDetailListNoteItem
              key={note._id}
              storageId={storage.id}
              note={note}
            />
          )
        })}
      </ul>
    </PageContainer>
  )
}

export default FolderDetail
