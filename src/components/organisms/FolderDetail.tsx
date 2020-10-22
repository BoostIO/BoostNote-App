import React, { useMemo } from 'react'
import { NoteStorage, NoteDoc } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import {
  values,
  isDirectSubPathname,
  getFolderNameFromPathname,
} from '../../lib/db/utils'
import { mdiNote } from '@mdi/js'
import Icon from '../atoms/Icon'
import PageContainer from '../atoms/PageContainer'
import FolderDetailListFolderItem from '../molecules/FolderDetailListFolderItem'

interface FolderDetailProps {
  storage: NoteStorage
  folderPathname: string
}

const FolderDetail = ({ storage, folderPathname }: FolderDetailProps) => {
  const { push } = useRouter()

  const subFolders = useMemo(() => {
    const folders = values(storage.folderMap)
    return folders.filter((folder) => {
      return isDirectSubPathname(folderPathname, folder.pathname)
    })
  }, [storage.folderMap, folderPathname])

  const notes = useMemo(() => {
    const folder = storage.folderMap[folderPathname]
    if (folder == null) {
      return []
    }

    return [...folder.noteIdSet].reduce((notes, noteId) => {
      const note = storage.noteMap[noteId]
      if (note != null && !note.trashed) {
        notes.push(note)
      }
      return notes
    }, [] as NoteDoc[])
  }, [storage, folderPathname])

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
            <li key={note._id}>
              <button
                onClick={() => {
                  push(
                    `/app/storages/${storage.id}/notes${folderPathname}/${note._id}`
                  )
                }}
              >
                <Icon path={mdiNote} />
                {note.title}
              </button>
            </li>
          )
        })}
      </ul>
    </PageContainer>
  )
}

export default FolderDetail
