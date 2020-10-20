import React, { useMemo } from 'react'
import { NoteStorage, NoteDoc } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import { values } from '../../lib/db/utils'
import { mdiFolder, mdiNote } from '@mdi/js'
import Icon from '../atoms/Icon'

interface FolderDetailProps {
  storage: NoteStorage
  folderPathname: string
}

const FolderDetail = ({ storage, folderPathname }: FolderDetailProps) => {
  const { push } = useRouter()

  const subFolders = useMemo(() => {
    const folders = values(storage.folderMap)
    return folders.filter((folder) => {
      return folder.pathname.includes(folderPathname + '/')
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
    <div>
      <h1>{folderPathname}</h1>
      <ul>
        {subFolders.map((folder) => {
          return (
            <li key={folder._id}>
              <button
                onClick={() => {
                  push(`/app/storages/${storage.id}/notes${folder.pathname}`)
                }}
              >
                <Icon path={mdiFolder} />
                {folder.pathname}
              </button>
            </li>
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
    </div>
  )
}

export default FolderDetail
